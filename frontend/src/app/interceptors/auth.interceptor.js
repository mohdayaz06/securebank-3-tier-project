(function () {
  'use strict';

  angular
    .module('secureBankApp')
    .factory('AuthInterceptor', AuthInterceptor)
    .config(configureInterceptor);

  AuthInterceptor.$inject = ['$q', '$injector'];
  function AuthInterceptor($q, $injector) {
    return {
      request: function (config) {
        var token = window.localStorage.getItem('securebank_token');
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = 'Bearer ' + token;
        }
        return config;
      },

      responseError: function (rejection) {
        if (rejection.status === 401) {
          window.localStorage.removeItem('securebank_token');
          window.localStorage.removeItem('securebank_user');
          var $location = $injector.get('$location');
          $location.path('/login');
        }
        return $q.reject(rejection);
      },
    };
  }

  configureInterceptor.$inject = ['$httpProvider'];
  function configureInterceptor($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  }
})();
