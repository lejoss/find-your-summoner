/**
 * Created by lejoss on 15/10/15.
 */
(function () {
    'use strict';

    angular
        .module('league-finder')
        .service('summonerService', summonerService);

    summonerService.$inject = ['$http', 'API_KEY'];

    function summonerService($http, API_KEY) {

        var service = {
            getSummoner: getSummoner,
            getLast5Games: getLast5Games,
            getChampionById: getChampionById
        }

        function getLast5Games(region, summonerId) {
            return $http.get('https://lan.api.pvp.net/api/lol/'+ region + '/v2.2/matchlist/by-summoner/'+ summonerId + '?beginIndex=0&endIndex=5&api_key=' + API_KEY);
        }
        function getSummoner(region, summonerName) {
            return $http.get('https://lan.api.pvp.net/api/lol/' + region + '/v1.4/summoner/by-name/' + summonerName + '?api_key=' + API_KEY);
        }
        function getChampionById(region, championId) {
            return $http.get('https://global.api.pvp.net/api/lol/static-data/'+ region +'/v1.2/champion/'+ championId +'?api_key=' +API_KEY);
        }

        return service;
    }
})();