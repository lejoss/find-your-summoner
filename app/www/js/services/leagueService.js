/**
 * Created by lejoss on 15/10/15.
 */
(function () {
    'use strict';

    angular
        .module('league-finder')
        .service('leagueService', leagueService);

    leagueService.$inject = ['$http', 'API_KEY'];

    function leagueService($http, API_KEY) {

        var service = {
            getSummoner: getSummoner,
            getLast5Games: getLast5Games,
            getChampionById: getChampionById,
            getMatchDetails: getMatchDetails
        }

        function getLast5Games(region, summonerId) {
            return $http.get('https://lan.api.pvp.net/api/lol/'+ region + '/v2.2/matchlist/by-summoner/'+ summonerId + '?rankedQueues=RANKED_SOLO_5x5,RANKED_TEAM_3x3,RANKED_TEAM_5x5&beginIndex=0&endIndex=5&api_key=' + API_KEY);
        }
        function getSummoner(region, summonerName) {
            return $http.get('https://lan.api.pvp.net/api/lol/' + region + '/v1.4/summoner/by-name/' + summonerName + '?api_key=' + API_KEY);
        }
        function getChampionById(region, championId) {
            return $http.get('https://global.api.pvp.net/api/lol/static-data/'+ region +'/v1.2/champion/'+ championId +'?api_key=' +API_KEY);
        }
        function getMatchDetails(region, matchId) {
            return $http.get('https://lan.api.pvp.net/api/lol/' + region + '/v2.2/match/' + matchId+ '?api_key=' + API_KEY);
        }

        return service;
    }
})();