from django.shortcuts import render
from django.urls import reverse
from django.views.generic import DetailView, UpdateView
from django.contrib.auth.models import User
from accounts.forms import UserProfileForm
from accounts.models import UserProfile

    
class ProfileDetailView(DetailView):
    model = User
    template_name = 'account/profile/view.html'

    def get_object(self, queryset=None):
        pk = self.kwargs.get(self.pk_url_kwarg, None)
        if pk is None:
            return self.request.user
        return super(ProfileDetailView, self).get_object(queryset)



class ProfileUpdateView(UpdateView):

    form_class = UserProfileForm
    model = UserProfile
    template_name = 'account/profile/edit.html'

    def get_object(self, queryset=None):
        return self.request.user.userprofile

    def get_success_url(self, *args, **kwargs):
        return reverse('profile')
