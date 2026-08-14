(function () {
  'use strict';

  angular.module('secureBankApp').controller('ShellController', ShellController);

  ShellController.$inject = ['$location', '$rootScope', 'AuthService', 'NotificationService'];
  function ShellController($location, $rootScope, AuthService, NotificationService) {
    var vm = this;

    vm.currentUser = AuthService.getCurrentUser();
    vm.isActive = isActive;
    vm.logout = logout;
    vm.initials = initials;
    vm.isSidebarOpen = false;
    vm.toggleSidebar = toggleSidebar;
    vm.closeSidebar = closeSidebar;

    // Toasts are rendered by the shell template so any controller in the
    // app can raise feedback via NotificationService without knowing
    // about the shell.
    vm.toasts = NotificationService.toasts;
    vm.dismissToast = NotificationService.dismiss;

    $rootScope.$on('$routeChangeSuccess', function () {
      vm.currentUser = AuthService.getCurrentUser();
      vm.isSidebarOpen = false; // close the mobile drawer on navigation
    });

    function isActive(path) {
      return $location.path().indexOf(path) === 0;
    }

    function logout() {
      AuthService.logout();
      $location.path('/login');
    }

    function initials(name) {
      if (!name) return '?';
      var parts = name.trim().split(/\s+/);
      return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
    }

    function toggleSidebar() {
      vm.isSidebarOpen = !vm.isSidebarOpen;
    }

    function closeSidebar() {
      vm.isSidebarOpen = false;
    }
  }
})();
