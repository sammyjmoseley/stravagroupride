from django.conf.urls import include, url

from django.contrib import admin
import django.contrib.auth.views


admin.autodiscover()

import hello.views

# Examples:
# url(r'^$', 'gettingstarted.views.home', name='home'),
# url(r'^blog/', include('blog.urls')),

urlpatterns = [
    url(r'^$', hello.views.index, name='index'),
    url(r'^login$', django.contrib.auth.views.login, name='login'),
    url(r'^new_account$', hello.views.new_account, name='new_account'),
    url(r'^create_user$', hello.views.create_user, name='create_user'),
    url(r'^strava$', hello.views.strava, name='strava'),
]
