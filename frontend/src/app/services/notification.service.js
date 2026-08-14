(function () {
  'use strict';

  /**
   * Lightweight toast notification service. Keeps a rolling list of
   * { id, type, message } objects on $rootScope-less shared state; the
   * ShellController's template renders whatever is currently in the list.
   * Toasts auto-dismiss after a few seconds but can also be dismissed
   * manually (see the "dismiss" call from the toast template).
   */
  angular.module('secureBankApp').factory('NotificationService', NotificationService);

  NotificationService.$inject = ['$timeout'];
  function NotificationService($timeout) {
    var toasts = [];
    var nextId = 1;
    var AUTO_DISMISS_MS = 5000;

    return {
      toasts: toasts,
      success: function (message) { return add('success', message); },
      error: function (message) { return add('danger', message); },
      info: function (message) { return add('info', message); },
      dismiss: dismiss,
    };

    function add(type, message) {
      var id = nextId++;
      toasts.push({ id: id, type: type, message: message });
      $timeout(function () {
        dismiss(id);
      }, AUTO_DISMISS_MS);
      return id;
    }

    function dismiss(id) {
      var index = toasts.findIndex(function (t) { return t.id === id; });
      if (index !== -1) toasts.splice(index, 1);
    }
  }
})();
