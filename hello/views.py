from django.shortcuts import render, redirect
from django.http import HttpResponse
from stravalib.client import Client
from django.template import loader, RequestContext
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from django.contrib.auth import logout
from .models import UserInfo, Activity
from django.conf import settings
import sys
import threading
import re, polyline
import json
GOOGLE_API = "AIzaSyBylN8Ogx4PL65ZAY3dTpMJQFhdEPCgexI"

client = Client()
if settings.DEBUG:
    client_id = 15202
    client_secret = "186822f6626fe7e66ae5bf77909999fe4f34529b"
    redirect_uri = 'http://localhost:5000/strava_authorize'
else:
    client_id = 000
    client_secret = ""
    redirect_uri = 'https://stravagroupride.herokuapp.com/strava_authorize'
authorize_url = client.authorization_url(client_id=client_id, redirect_uri=redirect_uri)

def is_administrator(user):
    return user.username=='sammyjmoseley'

def index(request):
    name = ""
    if request.user.is_authenticated():
        name = request.user.get_full_name()
    return render(request, 'index.html', {'name':name})


def strava(request):
    template = loader.get_template('login.html')
    context = {
        'authorize_url' : authorize_url,
    }
    return HttpResponse(template.render(context, request))

def login(request):
    return render(request, 'login.html')

@login_required(login_url='/login')
def strava_authorize(request):
    if 'code' not in request.GET:
        return HttpResponse(status=404)
    code = request.GET['code']
    access_token = client.exchange_code_for_token(client_id=client_id, client_secret=client_secret, code=code)
    athlete_id = client.get_athlete().id
    print >> sys.stderr, access_token + "\n"
    if UserInfo.objects.filter(athlete_id=athlete_id).exists():
        UserInfo.objects.get(athlete_id=athlete_id).user = request.user
        request.user.userinfo.strava_code = access_token
        request.user.userinfo.save()
    else:
        user = UserInfo(user=request.user, strava_code=access_token, athlete_id=athlete_id)
        user.save()

    return redirect('/account')

def new_account(request):
    return render(request, 'new_account.html')

@login_required(login_url='/login')
def account(request):
    name = ""
    name = request.user.get_full_name()
    connectedToStrava = False
    try:
        connectedToStrava = '' !=request.user.userinfo.strava_code
    except Exception as e:
        connectedToStrava = False

    params = {'name':name,
              'authorize_url' : authorize_url,
              'connectedToStrava' : connectedToStrava,
              'admin' : is_administrator(request.user)}
    return render(request, 'account.html', params)

@login_required(login_url='/login')
def logout_page(request):
    logout(request)
    return redirect('/')

@csrf_exempt
def create_user(request):
    if 'username' not in request.POST or 'password' not in request.POST:
        return HttpResponse(status=400)
    if 'firstname' not in request.POST or 'lastname' not in request.POST:
        return HttpResponse(status=400)
    user = User.objects.create_user(request.POST['username'], email=None, password=request.POST['password'])
    user.first_name = request.POST['firstname']
    user.last_name = request.POST['lastname']
    user.save()
    return HttpResponse(status=201)

@user_passes_test(is_administrator, login_url='/login')
def admin_view_users(request):
    user_list = []
    for user in User.objects.all():
        user_list += [{'name' : user.get_full_name(), 'username' : user.get_username()}]
    params = {
        'user_list' : user_list
    }
    return render(request, 'admin/users.html', params)

@user_passes_test(is_administrator, login_url='/login')
def admin_activities(request):
    activities = []
    for act in Activity.objects.all():
        activities += [{'athlete_name' : act.athlete_name, 'title' : act.title, 'id' : act.guid}]
    print >> sys.stderr, "Count: " + str(len(activities))
    params = {
        'activities' : activities
    }
    return render(request, 'admin/admin_activities.html', params)


@user_passes_test(is_administrator, login_url='/login')
def delete_user(request):
    if 'username' not in request.POST:
        return HttpResponse(status=400)
    user = User.objects.get(username=request.POST['username'])
    user.delete()

    return HttpResponse(status=204)

@user_passes_test(is_administrator, login_url='/login')
def refresh_activities(request):
    threading.Thread(target=Activity.getUserActivities, args=(request.user.userinfo,)).start()
    return HttpResponse(status=200)

@user_passes_test(is_administrator, login_url='/login')
def delete_activity(request):
    if 'id' not in request.POST:
        return HttpResponse(status=400)
    if request.POST['id'] == "-1":
        act = Activity.objects.all()
    else:
        act = Activity.objects.get(guid=request.POST['id'])
    act.delete()
    return HttpResponse(status=204)

@login_required(login_url='/login')
def change_name(request):
    if 'firstname' not in request.POST or 'lastname' not in request.POST:
        return HttpResponse(status=400)

    request.user.first_name = request.POST['firstname']
    request.user.last_name = request.POST['lastname']
    request.user.save()
    return HttpResponse(status=200);

@login_required(login_url='/login')
def change_password(request):
    if 'old_password' not in request.POST or 'new_password' not in request.POST:
        return HttpResponse(status=401)
    if  not request.user.check_password(request.POST['old_password']):
        return HttpResponse(status=400)

    request.user.set_password(request.POST['new_password']);
    request.user.save()
    return HttpResponse(status=200);

@login_required(login_url='/login')
def view_map(request):
    def get_user_list():
        user_list = []
        for u in UserInfo.objects.all():
            name = ""
            if u.user == None:
                name = u.strava_name
            else:
                name = u.user.get_full_name()
            user_list += [{"athlete_id" : u.athlete_id, "fullname" : name}]
        return user_list

    polyline_list = []
    for act in Activity.objects.all():
        # polyline_list += [re.escape(act.polyline)]
        # polyline_list += [act.polyline]
        str = "["
        for c in polyline.decode(act.polyline):
            str += "{lat: " + c[0].__repr__() +", lng:" + c[1].__repr__() + "},"
        str+="]"
        polyline_list += [{"title" : act.title, "points": str, "id" : act.guid, "athlete_id" : act.athlete_id}]



    params = {
        'polyline_list' : polyline_list,
        'user_list' : get_user_list(),
        'GOOGLE_API' : GOOGLE_API
    }
    return render(request, 'map.html', params)


def get_followers(request, id):
    followers=[]
    if(request.user.userinfo != None):
        followers += [str(request.user.userinfo.athlete_id)]
        client = Client(access_token = request.user.userinfo.strava_code)
        for f in client.get_athlete_friends():
            followers += [str(f.id)]
    return HttpResponse(json.dumps(followers), content_type="application/json")
