from django.db import models
from django.contrib.auth.models import AbstractBaseUser

class UserInfo(models.Model):
    username = models.CharField(max_length=255, primary_key=True)
    firstname = models.CharField(max_length=255)
    lastname = models.CharField(max_length=255)
    email = models.EmailField()
    strava_code = models.CharField(max_length=255)
