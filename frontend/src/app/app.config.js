(function () {
  'use strict';

  angular
    .module('secureBankApp')
    /**
     * Change this to point at your deployed backend. In this static-file
     * setup, override it at deploy time by editing this value (or template
     * it out during your Docker build / CI pipeline).
     */
    .constant('API_BASE_URL', 'http://localhost:5000/api')
    .config(routeConfig)
    .run(runBlock);

  routeConfig.$inject = ['$routeProvider', '$locationProvider'];
  function routeConfig($routeProvider, $locationProvider) {
    $routeProvider
      .when('/login', {
        templateUrl: 'app/views/login.html',
        controller: 'LoginController',
        controllerAs: 'vm',
        publicRoute: true,
      })
      .when('/register', {
        templateUrl: 'app/views/register.html',
        controller: 'RegisterController',
        controllerAs: 'vm',
        publicRoute: true,
      })
      .when('/dashboard', {
        templateUrl: 'app/views/dashboard.html',
        controller: 'DashboardController',
        controllerAs: 'vm',
      })
      .when('/accounts/:id', {
        templateUrl: 'app/views/account-detail.html',
        controller: 'AccountDetailController',
        controllerAs: 'vm',
      })
      .when('/transfer', {
        templateUrl: 'app/views/transfer.html',
        controller: 'TransferController',
        controllerAs: 'vm',
      })
      .when('/profile', {
        templateUrl: 'app/views/profile.html',
        controller: 'ProfileController',
        controllerAs: 'vm',
      })
      .otherwise({ redirectTo: '/dashboard' });

    $locationProvider.hashPrefix('!');
  }

  runBlock.$inject = ['$rootScope', '$location', 'AuthService'];
  function runBlock($rootScope, $location, AuthService) {
    // Route guard: redirect unauthenticated users to /login for any route
    // that isn't explicitly marked as public.
    $rootScope.$on('$routeChangeStart', function (event, next) {
      var isPublic = next && next.$$route && next.$$route.publicRoute;
      if (!isPublic && !AuthService.isAuthenticated()) {
        $location.path('/login');
      }
    });
  }
})();
