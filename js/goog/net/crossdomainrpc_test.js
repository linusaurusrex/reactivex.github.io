// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.net.CrossDomainRpcTest');
goog.setTestOnly('goog.net.CrossDomainRpcTest');

goog.require('goog.log');
goog.require('goog.log.Level');
goog.require('goog.net.CrossDomainRpc');
goog.require('goog.testing.jsunit');

// TODO(user): These tests are in fact async since the send command makes a
// request for a file, the reason they do not fail is that the JsUnit test
// runner reports completion after the testFoo functions are finished, and
// does not catch any errors after this point.  These tests need updating so
// that they either mock out the async part of the test, or they should be
// written as an async test case.

function print(o) {
  if (Object.prototype.toSource) {
    return o.toSource();
  } else {
    var fragments = [];
    fragments.push('{');
    var first = true;
    for (var p in o) {
      if (!first) fragments.push(',');
      fragments.push(p);
      fragments.push(':"');
      fragments.push(o[p]);
      fragments.push('"');
      first = false;
    }
    return fragments.join('');
  }
}


function testNormalRequest() {
  var start = new Date();
  goog.net.CrossDomainRpc.send(
      'crossdomainrpc_test_response.html',
      function(e) {
        if (e.target.status < 300) {
          var elapsed = new Date() - start;
          var responseData = eval(e.target.responseText);
          goog.log.log(goog.net.CrossDomainRpc.logger_, goog.log.Level.FINE,
              elapsed + 'ms: [' + responseData.result.length + '] ' +
              print(responseData)
          );
          assertEquals(16 * 1024, responseData.result.length);
          assertEquals(e.target.status, 123);
          assertEquals(e.target.responseHeaders.a, 1);
          assertEquals(e.target.responseHeaders.b, '2');
        } else {
          goog.log.log(goog.net.CrossDomainRpc.logger_, goog.log.Level.FINE,
              print(e));
          fail();
        }
      },
      'POST',
      {xyz: '01234567891123456789'}
  );
}


function testErrorRequest() {
  goog.net.CrossDomainRpc.send(
      'http://hoodjimcwaadji.google.com/index.html',
      function(e) {
        if (e.target.status < 300) {
          fail('should have failed requesting a non-existent URI');
        } else {
          goog.log.log(goog.net.CrossDomainRpc.logger_, goog.log.Level.FINE,
              'expected error seen; event=' + print(e));
        }
      },
      'POST',
      {xyz: '01234567891123456789'}
  );
}


function testGetDummyResourceUri() {
  var url = goog.net.CrossDomainRpc.getDummyResourceUri_();
  assertTrue(
      'dummy resource URL should not contain "?"', url.indexOf('?') < 0);
  assertTrue(
      'dummy resource URL should not contain "#"', url.indexOf('#') < 0);
}


function testRemoveHash() {
  assertEquals('abc', goog.net.CrossDomainRpc.removeHash_('abc#123'));
  assertEquals('abc', goog.net.CrossDomainRpc.removeHash_('abc#12#3'));
}
