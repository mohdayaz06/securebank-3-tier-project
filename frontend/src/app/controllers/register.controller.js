(function () {
  'use strict';

  angular.module('secureBankApp').controller('RegisterController', RegisterController);

  RegisterController.$inject = ['$location', 'AuthService'];
  function RegisterController($location, AuthService) {
    var vm = this;

    vm.form = { fullName: '', email: '', phone: '', password: '' };
    vm.confirmPassword = '';
    vm.isSubmitting = false;
    vm.errorMessage = '';
    vm.submit = submit;
    vm.onPasswordChange = onPasswordChange;

    // Simple, transparent strength heuristic (not a security control -
    // the real requirements are enforced server-side). Purely a UX nudge.
    vm.passwordStrength = { score: 0, label: '', className: '' };

    function onPasswordChange() {
      vm.passwordStrength = scorePassword(vm.form.password || '');
    }

    function scorePassword(password) {
      var score = 0;
      if (password.length >= 8) score += 1;
      if (password.length >= 12) score += 1;
      if (/[A-Z]/.test(password)) score += 1;
      if (/[0-9]/.test(password)) score += 1;
      if (/[^A-Za-z0-9]/.test(password)) score += 1;

      if (password.length === 0) return { score: 0, label: '', className: '' };
      if (score <= 2) return { score: score, label: 'Weak', className: 'weak' };
      if (score <= 3) return { score: score, label: 'Fair', className: 'fair' };
      if (score === 4) return { score: score, label: 'Good', className: 'good' };
      return { score: score, label: 'Strong', className: 'strong' };
    }

    function submit(registerForm) {
      if (registerForm.$invalid) {
        vm.errorMessage = 'Please fill in all required fields correctly.';
        return;
      }

      if (vm.form.password !== vm.confirmPassword) {
        vm.errorMessage = 'Passwords do not match.';
        return;
      }

      vm.isSubmitting = true;
      vm.errorMessage = '';

      AuthService.register(vm.form)
        .then(function () {
          $location.path('/dashboard');
        })
        .catch(function (err) {
          var details = err.data && err.data.details;
          vm.errorMessage = details && details.length
            ? details.map(function (d) { return d.message || d; }).join(' ')
            : (err.data && err.data.message) || 'Registration failed. Please try again.';
        })
        .finally(function () {
          vm.isSubmitting = false;
        });
    }
  }
})();
