# from django.conf import settings
import sys

def api_keys(request):
    print >> sys.stderr, "hello" + "\n"
    return{'GOOGLE_API' : "hello"}
