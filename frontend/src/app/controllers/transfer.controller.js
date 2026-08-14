(function () {
  'use strict';

  angular.module('secureBankApp').controller('TransferController', TransferController);

  TransferController.$inject = ['AccountService', 'TransferService', 'NotificationService'];
  function TransferController(AccountService, TransferService, NotificationService) {
    var vm = this;

    // step: 'form' -> 'review' -> 'success'
    // Mirrors a real banking transfer flow: nothing is submitted to the
    // API until the customer has explicitly reviewed and confirmed it.
    vm.step = 'form';
    vm.accounts = [];
    vm.form = { fromAccountId: '', toAccountNumber: '', amount: null, description: '' };
    vm.isLoading = true;
    vm.isSubmitting = false;
    vm.errorMessage = '';
    vm.successResult = null;

    vm.reviewTransfer = reviewTransfer;
    vm.confirmTransfer = confirmTransfer;
    vm.backToForm = backToForm;
    vm.sendAnother = sendAnother;
    vm.selectedFromAccount = selectedFromAccount;

    activate();

    function activate() {
      AccountService.list()
        .then(function (accounts) {
          vm.accounts = accounts;
          if (accounts.length > 0) {
            vm.form.fromAccountId = accounts[0].id;
          }
        })
        .catch(function () {
          vm.errorMessage = 'Could not load your accounts.';
        })
        .finally(function () {
          vm.isLoading = false;
        });
    }

    function selectedFromAccount() {
      return vm.accounts.filter(function (a) { return String(a.id) === String(vm.form.fromAccountId); })[0];
    }

    /** Step 1 -> 2: client-side checks only, nothing hits the API yet. */
    function reviewTransfer(transferForm) {
      vm.errorMessage = '';

      if (transferForm.$invalid) {
        vm.errorMessage = 'Please correct the highlighted fields.';
        return;
      }

      var fromAccount = selectedFromAccount();
      if (fromAccount && Number(vm.form.amount) > Number(fromAccount.balance)) {
        vm.errorMessage = 'This amount exceeds the available balance on the selected account.';
        return;
      }
      if (fromAccount && fromAccount.account_number === vm.form.toAccountNumber) {
        vm.errorMessage = 'You cannot transfer to the same account.';
        return;
      }

      vm.step = 'review';
    }

    /** Step 2 -> 3: this is the only point the transfer actually happens. */
    function confirmTransfer() {
      vm.isSubmitting = true;
      vm.errorMessage = '';

      TransferService.send(vm.form)
        .then(function (result) {
          vm.successResult = result;
          vm.step = 'success';
          NotificationService.success('Transfer of $' + Number(result.amount).toFixed(2) + ' completed.');
        })
        .catch(function (err) {
          var details = err.data && err.data.details;
          vm.errorMessage = details && details.length
            ? details.map(function (d) { return d.message || d; }).join(' ')
            : (err.data && err.data.message) || 'Transfer failed. Please try again.';
          vm.step = 'form';
        })
        .finally(function () {
          vm.isSubmitting = false;
        });
    }

    function backToForm() {
      vm.step = 'form';
    }

    function sendAnother() {
      vm.successResult = null;
      vm.step = 'form';
      vm.form = { fromAccountId: vm.accounts[0] ? vm.accounts[0].id : '', toAccountNumber: '', amount: null, description: '' };
      // Refresh balances so the next review step reflects the just-completed transfer
      AccountService.list().then(function (accounts) { vm.accounts = accounts; });
    }
  }
})();
