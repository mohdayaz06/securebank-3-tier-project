(function () {
  'use strict';

  angular.module('secureBankApp').factory('TransactionService', TransactionService);

  TransactionService.$inject = ['$http', 'API_BASE_URL'];
  function TransactionService($http, API_BASE_URL) {
    return {
      history: history,
      deposit: deposit,
      withdraw: withdraw,
    };

    function history(accountId, params) {
      return $http
        .get(API_BASE_URL + '/transactions/account/' + accountId, { params: params || {} })
        .then(function (response) {
          return response.data;
        });
    }

    function deposit(payload) {
      return $http.post(API_BASE_URL + '/transactions/deposit', payload).then(function (response) {
        return response.data.data;
      });
    }

    function withdraw(payload) {
      return $http.post(API_BASE_URL + '/transactions/withdraw', payload).then(function (response) {
        return response.data.data;
      });
    }
  }
})();
