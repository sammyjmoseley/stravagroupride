from django.shortcuts import render
from django.http import HttpResponse
from stravalib.client import Client
from django.template import loader
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from .models import UserInfo

client = Client()
authorize_url = client.authorization_url(client_id=1675, redirect_uri='https://stravagroupride.herokuapp.com/authorized')
# Create your views here.
def index(request):
    user = UserInfo.objects.get(pk=request.user.username)
    return render(request, 'index.html', {'userv':user})


def strava(request):
    template = loader.get_template('login.html')
    context = {
        'authorize_url' : authorize_url,
    }

    return HttpResponse(template.render(context, request))
def login(request):
    return render(request, 'login.html')

def new_account(request):
    return render(request, 'new_account.html')

@csrf_exempt
def create_user(request):
    if 'username' not in request.POST or 'password' not in request.POST:
        return HttpResponse(status=401)
    if 'firstname' not in request.POST or 'lastname' not in request.POST:
        return HttpResponse(status=401)
    user = User.objects.create_user(request.POST['username'], email=None, password=request.POST['password']);
    userinfo = UserInfo(firstname = request.POST['firstname'], lastname = request.POST['lastname'], username=request.POST['username'])
    userinfo.save()
    user.save()
    return HttpResponse(status=201)
