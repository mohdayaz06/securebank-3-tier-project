(function () {
  'use strict';

  angular.module('secureBankApp').controller('LoginController', LoginController);

  LoginController.$inject = ['$location', 'AuthService'];
  function LoginController($location, AuthService) {
    var vm = this;

    vm.credentials = { email: '', password: '' };
    vm.isSubmitting = false;
    vm.errorMessage = '';
    vm.showPassword = false;
    vm.submit = submit;
    vm.togglePasswordVisibility = togglePasswordVisibility;

    if (AuthService.isAuthenticated()) {
      $location.path('/dashboard');
    }

    function togglePasswordVisibility() {
      vm.showPassword = !vm.showPassword;
    }

    function submit(loginForm) {
      if (loginForm.$invalid) {
        vm.errorMessage = 'Please enter a valid email and password.';
        return;
      }

      vm.isSubmitting = true;
      vm.errorMessage = '';

      AuthService.login(vm.credentials)
        .then(function () {
          $location.path('/dashboard');
        })
        .catch(function (err) {
          vm.errorMessage = (err.data && err.data.message) || 'Login failed. Please try again.';
        })
        .finally(function () {
          vm.isSubmitting = false;
        });
    }
  }
})();
