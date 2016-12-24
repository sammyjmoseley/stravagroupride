from django.conf.urls import url

urlpatterns = [
    url(r'^users$', hello.views.admin_view_users),
]
