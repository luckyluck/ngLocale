Module for AngularJS easy localization.

## Install

npm install ng.locale
After installation you should add 'ng.locale' as a required module to your app.

## Configuration

There is one way to configure ngLocale module. 
For this you should add `ngLocaleConfigProvider` to your app config section and add a list of params:
```javascript
ngLocaleConfigProvider.$get('setConfig').setConfig({
    localUrl: 'locale_url',
    restUrl: 'rest_url',
    prefix: 'your_prefix',
    toStore: false
});
```
* `locale_url` - it's yor locale url for localization. usually it's link to local static json file
* `rest_url` - if you want to request localization from a server
* `prefix` - if you have a prefix in your localization keys
* `toStore` - if you want module to store localization in local storage, then you should choose `true` for this option.

## How to use

**As attribute**
To use module as an attribute you should just write this:
```html
<span ng-locale="locale_key"></span>
<span ng-locale="{{$scope.localeKey}}"></span>
```
Module will bind localized value to this `span` element.
If attribute does not find the value for your key, it will return `empty string` as a result (using service).

**As a filter**
If you want to use module as a filter, you can write this:
```javascript
{{ 'locale_key' | localize }}
```
and the key will be replaced with localized value.
If filter does not find the value for your key, it will return `undefined` as a result.

**As a service in controller**
If you want to use module in your code, first of all you should add `ngLocaleService` as a DI to your controller/service.
Then you can use service like this:
```javascript
var self = this;
ngLocaleService.$$get('locale_key').then(function (response) {
  self.translate = response;
});
```
If service does not find the value for your key, it will return `empty string` as a result.

Also, if you need to localize more than one key, you should just add all of them as parameters:
```javascript
var self = this;
ngLocaleService.$$get('key1', 'key2', 'key3').then(function (response) {
  self.key1 = response['key1'];
  self.key2 = response['key2'];
  self.key3 = response['key3'];
});
```
In that case service will return object, where keys will be your params and values for this keys - localized strings (or `empty string`).


If you find bug or you have any idea how to do better, 
I'll be glad to here about it and to improve ngLocale for you.
