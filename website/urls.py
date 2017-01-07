from django.conf.urls import include, url

from django.contrib import admin
import django.contrib.auth.views


admin.autodiscover()

import hello.views

# Examples:
# url(r'^$', 'website.views.home', name='home'),
# url(r'^blog/', include('blog.urls')),

admin = [
    url(r'^users$', hello.views.admin_view_users),
    url(r'^delete_user$', hello.views.delete_user),
    url(r'^delete_activity$', hello.views.delete_activity),
    url(r'^view_activities$', hello.views.admin_activities),
]


urlpatterns = [
    url(r'^admin/', include(admin)),
    url(r'^$', hello.views.index, name='index'),
    url(r'^login$', django.contrib.auth.views.login, name='login'),
    url(r'^account$', hello.views.account, name='account'),
    url(r'^strava_authorize$', hello.views.strava_authorize, name='strava_authorize' ),
    url(r'^logout$', hello.views.logout_page, name='logout_page'),
    url(r'^new_account$', hello.views.new_account, name='new_account'),
    url(r'^create_user$', hello.views.create_user, name='create_user'),
    url(r'^strava$', hello.views.strava, name='strava'),
    url(r'^refresh_activities$', hello.views.refresh_activities),
    url(r'^change_name$', hello.views.change_name),
    url(r'^change_password$', hello.views.change_password),
    url(r'^map$', hello.views.view_map),
    url(r'^followers/(?P<id>[0-9]+)/$', hello.views.get_followers)
]
