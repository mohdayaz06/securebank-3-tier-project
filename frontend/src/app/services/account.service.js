(function () {
  'use strict';

  angular.module('secureBankApp').factory('AccountService', AccountService);

  AccountService.$inject = ['$http', 'API_BASE_URL'];
  function AccountService($http, API_BASE_URL) {
    return {
      list: list,
      get: get,
      open: open,
      rename: rename,
    };

    function list() {
      return $http.get(API_BASE_URL + '/accounts').then(function (response) {
        return response.data.data;
      });
    }

    function get(id) {
      return $http.get(API_BASE_URL + '/accounts/' + id).then(function (response) {
        return response.data.data;
      });
    }

    function open(payload) {
      return $http.post(API_BASE_URL + '/accounts', payload).then(function (response) {
        return response.data.data;
      });
    }

    function rename(id, nickname) {
      return $http.patch(API_BASE_URL + '/accounts/' + id, { nickname: nickname }).then(function (response) {
        return response.data.data;
      });
    }
  }
})();
