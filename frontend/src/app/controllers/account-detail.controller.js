(function () {
  'use strict';

  angular.module('secureBankApp').controller('AccountDetailController', AccountDetailController);

  AccountDetailController.$inject = [
    '$routeParams',
    'AccountService',
    'TransactionService',
    'NotificationService',
  ];
  function AccountDetailController($routeParams, AccountService, TransactionService, NotificationService) {
    var vm = this;
    var accountId = $routeParams.id;

    vm.account = null;
    vm.transactions = [];
    vm.pagination = { page: 1, limit: 10, total: 0, pages: 0 };
    vm.filters = { search: '', type: '' };
    vm.isLoading = true;
    vm.isMasked = true;
    vm.errorMessage = '';

    // Inline nickname editing
    vm.isEditingNickname = false;
    vm.nicknameDraft = '';
    vm.isSavingNickname = false;

    // Deposit / withdraw quick-action panel
    vm.activePanel = null; // null | 'deposit' | 'withdraw'
    vm.moneyForm = { amount: null, description: '' };
    vm.isSubmittingMoney = false;
    vm.moneyError = '';

    vm.goToPage = goToPage;
    vm.applyFilters = applyFilters;
    vm.toggleMask = toggleMask;
    vm.startEditNickname = startEditNickname;
    vm.cancelEditNickname = cancelEditNickname;
    vm.saveNickname = saveNickname;
    vm.openPanel = openPanel;
    vm.closePanel = closePanel;
    vm.submitMoney = submitMoney;
    vm.exportCsv = exportCsv;

    activate();

    function activate() {
      loadAccount();
      loadHistory(1);
    }

    function loadAccount() {
      AccountService.get(accountId)
        .then(function (account) {
          vm.account = account;
        })
        .catch(function () {
          vm.errorMessage = 'Could not load this account.';
        });
    }

    function loadHistory(page) {
      vm.isLoading = true;
      var params = { page: page, limit: vm.pagination.limit };
      if (vm.filters.search) params.search = vm.filters.search;
      if (vm.filters.type) params.type = vm.filters.type;

      TransactionService.history(accountId, params)
        .then(function (result) {
          vm.transactions = result.data;
          vm.pagination = { page: result.page, limit: vm.pagination.limit, total: result.total, pages: result.pages };
        })
        .catch(function () {
          vm.errorMessage = 'Could not load transaction history.';
        })
        .finally(function () {
          vm.isLoading = false;
        });
    }

    function goToPage(page) {
      if (page < 1 || page > vm.pagination.pages) return;
      loadHistory(page);
    }

    function applyFilters() {
      loadHistory(1);
    }

    function toggleMask() {
      vm.isMasked = !vm.isMasked;
    }

    function startEditNickname() {
      vm.nicknameDraft = vm.account.nickname || '';
      vm.isEditingNickname = true;
    }

    function cancelEditNickname() {
      vm.isEditingNickname = false;
    }

    function saveNickname() {
      vm.isSavingNickname = true;
      AccountService.rename(accountId, vm.nicknameDraft)
        .then(function (updated) {
          vm.account.nickname = updated.nickname;
          vm.isEditingNickname = false;
          NotificationService.success('Account label updated.');
        })
        .catch(function (err) {
          NotificationService.error((err.data && err.data.message) || 'Could not update the account label.');
        })
        .finally(function () {
          vm.isSavingNickname = false;
        });
    }

    function openPanel(type) {
      vm.activePanel = type;
      vm.moneyForm = { amount: null, description: '' };
      vm.moneyError = '';
    }

    function closePanel() {
      vm.activePanel = null;
    }

    function submitMoney(moneyForm) {
      if (moneyForm.$invalid) {
        vm.moneyError = 'Enter a valid amount.';
        return;
      }

      vm.isSubmittingMoney = true;
      vm.moneyError = '';

      var payload = { accountId: accountId, amount: vm.moneyForm.amount, description: vm.moneyForm.description };
      var action = vm.activePanel === 'deposit' ? TransactionService.deposit : TransactionService.withdraw;

      action(payload)
        .then(function (result) {
          vm.account.balance = result.newBalance;
          NotificationService.success(
            (vm.activePanel === 'deposit' ? 'Deposit' : 'Withdrawal') + ' of $' + Number(vm.moneyForm.amount).toFixed(2) + ' completed.'
          );
          vm.activePanel = null;
          loadHistory(1);
        })
        .catch(function (err) {
          vm.moneyError = (err.data && err.data.message) || 'This request could not be completed.';
        })
        .finally(function () {
          vm.isSubmittingMoney = false;
        });
    }

    /** Exports the currently-loaded page of transactions as a CSV file. */
    function exportCsv() {
      if (!vm.transactions.length) return;

      var header = ['Date', 'Description', 'Type', 'Amount', 'Balance after'];
      var rows = vm.transactions.map(function (t) {
        return [
          new Date(t.created_at).toISOString(),
          '"' + (t.description || '').replace(/"/g, '""') + '"',
          t.type,
          t.amount,
          t.balance_after,
        ].join(',');
      });
      var csv = [header.join(','), rows.join('\n')].join('\n');

      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = 'statement-' + (vm.account ? vm.account.account_number : accountId) + '.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
})();
