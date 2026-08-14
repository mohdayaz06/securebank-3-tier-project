(function () {
  'use strict';

  angular.module('secureBankApp').controller('ProfileController', ProfileController);

  ProfileController.$inject = ['AuthService', 'NotificationService'];
  function ProfileController(AuthService, NotificationService) {
    var vm = this;

    vm.profile = { fullName: '', phone: '' };
    vm.passwordForm = { currentPassword: '', newPassword: '' };
    vm.isLoading = true;
    vm.isSavingProfile = false;
    vm.isSavingPassword = false;
    vm.profileMessage = '';
    vm.profileError = '';
    vm.passwordMessage = '';
    vm.passwordError = '';

    vm.saveProfile = saveProfile;
    vm.savePassword = savePassword;

    activate();

    function activate() {
      AuthService.fetchProfile()
        .then(function (user) {
          vm.profile = { fullName: user.full_name, phone: user.phone, email: user.email };
        })
        .catch(function () {
          vm.profileError = 'Could not load your profile.';
        })
        .finally(function () {
          vm.isLoading = false;
        });
    }

    function saveProfile(profileForm) {
      if (profileForm.$invalid) return;

      vm.isSavingProfile = true;
      vm.profileMessage = '';
      vm.profileError = '';

      AuthService.updateProfile({ fullName: vm.profile.fullName, phone: vm.profile.phone })
        .then(function () {
          vm.profileMessage = 'Profile updated successfully.';
          NotificationService.success('Your profile has been updated.');
        })
        .catch(function (err) {
          vm.profileError = (err.data && err.data.message) || 'Failed to update profile.';
        })
        .finally(function () {
          vm.isSavingProfile = false;
        });
    }

    function savePassword(passwordForm) {
      if (passwordForm.$invalid) return;

      vm.isSavingPassword = true;
      vm.passwordMessage = '';
      vm.passwordError = '';

      AuthService.changePassword(vm.passwordForm)
        .then(function () {
          vm.passwordMessage = 'Password updated successfully.';
          NotificationService.success('Your password has been changed.');
          vm.passwordForm = { currentPassword: '', newPassword: '' };
          passwordForm.$setPristine();
          passwordForm.$setUntouched();
        })
        .catch(function (err) {
          var details = err.data && err.data.details;
          vm.passwordError = details && details.length
            ? details.map(function (d) { return d.message || d; }).join(' ')
            : (err.data && err.data.message) || 'Failed to update password.';
        })
        .finally(function () {
          vm.isSavingPassword = false;
        });
    }
  }
})();
