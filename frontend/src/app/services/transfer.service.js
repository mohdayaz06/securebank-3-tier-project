(function () {
  'use strict';

  angular.module('secureBankApp').factory('TransferService', TransferService);

  TransferService.$inject = ['$http', 'API_BASE_URL'];
  function TransferService($http, API_BASE_URL) {
    return {
      send: send,
      list: list,
    };

    function send(payload) {
      return $http.post(API_BASE_URL + '/transfers', payload).then(function (response) {
        return response.data.data;
      });
    }

    function list(params) {
      return $http.get(API_BASE_URL + '/transfers', { params: params || {} }).then(function (response) {
        return response.data.data;
      });
    }
  }
})();
