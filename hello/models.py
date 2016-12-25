from django.db import models
from django.contrib.auth.models import User
from pybloom import ScalableBloomFilter
from stravalib.client import Client, exc
import sys
import logging
import unicodedata
import time

# Get an instance of a logger
logger = logging.getLogger(__name__)

client_id = 15202

#converts str to ascii encoding
def ctascii(str):
    return unicodedata.normalize('NFKD', str).encode('ascii', 'ignore')

athlete_cache={}

class UserInfo(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, unique=True, blank=True, null=True)
    athlete_id = models.IntegerField(unique=True)
    strava_name = models.CharField(max_length=255, default = 'not set')
    strava_code = models.CharField(max_length=255, default = '')

class Activity(models.Model):
    guid = models.IntegerField(primary_key=True)
    athlete_id = models.IntegerField()
    athlete_name = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    month = models.IntegerField() #month (0-11)
    dotw = models.IntegerField() #day of the week (0-6)
    polyline = models.TextField()
    related_activities = models.ManyToManyField("self")

    def get_polyline(self):
        if polyline==None:
            strava_code = UserInfo.objects.filter(athlete_id = self.athlete_id)
            client = Client(access_token = strava_code)
            activity = client.get_activity(self.guid)
            self.polyline = activity.map.polyline
            return self.polyline
        else:
            return self.polyline

    @staticmethod
    def client_call(method, params, sleep=10):
        try:
            method(*params)
        except exc.RateLimitExceeded as e:
            time.sleep(sleep)
            client_call(method, params, sleep=2*sleep)


    @staticmethod
    def create_activity(activity, client):
        if activity.athlete.id in athlete_cache:
            athlete = athlete_cache[activity.athlete.id]
        else:
            athlete = client.get_athlete(activity.athlete.id)
            athlete_cache[activity.athlete.id] = athlete

        act = Activity(guid=activity.id)
        act.athlete_id = activity.athlete.id
        act.athlete_name = ctascii(athlete.firstname + " " + athlete.lastname)
        act.title = ctascii(activity.name)
        act.month = activity.start_date_local.month
        act.dotw = activity.start_date_local.weekday()

        if not UserInfo.objects.filter(athlete_id=act.athlete_id).exists():
            user = UserInfo(athlete_id = act.athlete_id)
            user.user = None
            user.strava_name = act.athlete_name
            user.save()
            print >> sys.stderr, "other user added: " + user.strava_name.__repr__()


        #act.polyline = client.get_activity(activity.id).map.polyline
        act.polyline = activity.map.summary_polyline
        if act.polyline==None:
            act.polyline = ""

        # print >> sys.stderr, "Got Activity: "+ str(act.guid) + "," + str(act.polyline) + "\n"
        act.save()
        return act

    @staticmethod
    def get_strava_users():
        users = UserInfo.objects.all()
        for u in users:
            if (u.strava_code==''):
                continue
            yield u

    @staticmethod
    def get_strava_activities(user, client):
        for activity in client.get_activities():
            yield activity
            for rel_activity in activity.related:
                yield rel_activity

    @staticmethod
    def getUserActivities(user):
        client = Client(access_token = user.strava_code)
        for activity in Activity.get_strava_activities(user, client):

            if not Activity.objects.filter(pk=activity.guid).exists():
                act = Activity.create_activity(activity, client)

    @staticmethod
    def refreshActivities():
        for user in Activity.get_strava_users():
            client = Client(access_token = user.strava_code)
            for activity in Activity.get_strava_activities(user, client):
                print >> sys.stderr, "Got Activity: "+ str(activity.id) + "\n"
                if not Activity.objects.filter(pk=activity.guid).exists():
                    act = Activity.create_activity(activity, client)
                else:
                    act = Activity.objects.get(pk=activity.guid)
                for rel_activity in activity.related:
                    print >> sys.stderr, "Got Activity: "+ str(rel_activity.id) + "\n"
                    if not Activity.objects.filter(pk=rel_activity.guid).exists():
                        rel_act = Activity.create_activity(rel_activity, client)
                    else:
                        rel_act = Activity.objects.get(pk=rel_activity.guid)
                    act.related_activities.add(rel_act)
