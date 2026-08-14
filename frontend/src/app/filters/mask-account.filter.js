(function () {
  'use strict';

  /**
   * Usage: {{ account.account_number | maskAccount }}
   * Renders "•••• •••• 4501"-style masking, the standard fintech pattern
   * for displaying account numbers without exposing the full value.
   */
  angular.module('secureBankApp').filter('maskAccount', maskAccountFilter);

  function maskAccountFilter() {
    return function (accountNumber) {
      if (!accountNumber) return '';
      var str = String(accountNumber);
      var last4 = str.slice(-4);
      return '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ' + last4;
    };
  }
})();
