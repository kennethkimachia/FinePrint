import traceback
import os
from django.http import JsonResponse

class ExceptionLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            # Write traceback to django_errors.log in the Backend folder
            log_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'django_errors.log')
            try:
                with open(log_path, 'a') as f:
                    f.write(f"\n--- Exception at {request.path} ---\n")
                    traceback.print_exc(file=f)
            except Exception:
                pass
            
            # Also return it as a JSON response so the frontend catches it cleanly!
            return JsonResponse(
                {"error": f"Server crash: {str(e)}", "traceback": traceback.format_exc()},
                status=500
            )

    def process_exception(self, request, exception):
        # This catches exceptions raised in views
        log_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'django_errors.log')
        try:
            with open(log_path, 'a') as f:
                f.write(f"\n--- View Exception at {request.path} ---\n")
                traceback.print_exc(file=f)
        except Exception:
            pass
            
        return JsonResponse(
            {"error": f"View crash: {str(exception)}", "traceback": traceback.format_exc()},
            status=500
        )
