(function () {
  'use strict';

  angular.module('secureBankApp').controller('DashboardController', DashboardController);

  DashboardController.$inject = ['AccountService', 'TransferService', 'AuthService'];
  function DashboardController(AccountService, TransferService, AuthService) {
    var vm = this;

    vm.accounts = [];
    vm.totalBalance = 0;
    vm.recentTransfers = [];
    vm.isLoading = true;
    vm.errorMessage = '';
    vm.currentUser = AuthService.getCurrentUser();
    vm.isMasked = true;
    vm.toggleMask = toggleMask;
    vm.greeting = greeting();

    activate();

    function activate() {
      vm.isLoading = true;

      AccountService.list()
        .then(function (accounts) {
          vm.accounts = accounts;
          vm.totalBalance = accounts.reduce(function (sum, a) { return sum + Number(a.balance); }, 0);
        })
        .catch(function () {
          vm.errorMessage = 'Could not load your accounts.';
        });

      TransferService.list({ limit: 5 })
        .then(function (transfers) {
          vm.recentTransfers = transfers;
        })
        .catch(function () {
          // non-fatal: dashboard still works without recent transfers
        })
        .finally(function () {
          vm.isLoading = false;
        });
    }

    function toggleMask() {
      vm.isMasked = !vm.isMasked;
    }

    function greeting() {
      var hour = new Date().getHours();
      if (hour < 12) return 'Good morning';
      if (hour < 18) return 'Good afternoon';
      return 'Good evening';
    }
  }
})();
