from django.urls import include, path
from django.contrib.auth.decorators import login_required
from hsequploader.apps.uploader.views import *
from hsequploader.apps.uploader.tus_views import TusUpload

urlpatterns = [
    path('', UploadCreateView.as_view(), name='uploader-upload'),
    path('upload-form', UploadCreate2View.as_view(), name='uploader-upload_form'),
    path('tus_upload/', TusUpload.as_view(), name='tus_upload'),
    path('tus_upload/<uuid:resource_id>', TusUpload.as_view(), name='tus_upload_chunks'),

    path('view/<int:pk>', UploadDetailView.as_view(), name='uploader-view'),
    path('list', UploadListView.as_view(), name='uploader-list'),

    path('submission', submission_list_view , name='uploader-submission_list'),
    path('submission/<path:iri>', submission_details_view , name='uploader-submission_details')
]
