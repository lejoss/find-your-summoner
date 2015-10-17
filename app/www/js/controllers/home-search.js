(function () {
    'use strict';

    angular
        .module('league-finder')
        .controller('HomeSearch', HomeSearch);

    HomeSearch.$inject = ['$scope', '$ionicPopup', 'summonerService', '$q'];

    function HomeSearch($scope, $ionicPopup, summonerService, $q) {

        $scope.summoner           = null;   // summoner details
        $scope.summonerInput      = null;   // input used to query summoners data
        $scope.data               = {
            userRegion: null
        };

        // lists
        $scope.regions            = [
            { text: "Brazil", value: "br" },
            { text: "Europe Nordic & East", value: "eune" },
            { text: "Europe West", value: "euw" },
            { text: "Latin America North", value: "lan" },
            { text: "Latin America South", value: "las" },
            { text: "North America", value: "na" },
            { text: "Oceania", value: "oce" },
            { text: "Russia", value: "ru" },
            { text: "Turkey", value: "tr" },
            { text: "South East Asia", value: "sea" },
            { text: "Republic of Korea", value: "kr" }
        ];  // lol regions
        $scope.matches            = [];     // raw list of summoner's last five games
        $scope.champions          = [];     // raw list of champions involved in last games
        $scope.championsPromise   = [];     // array of promises used to return $q.all()
        $scope.lastMatches        = [];     // array to be displayed on view

        // methods
        $scope.selectRegion       = selectRegion;
        $scope.getLastMatches     = getLastMatches;

        //////////////////////////////////////////////////////////////////////////////////

        function selectRegion() {
            var selectRegionPopup = $ionicPopup.show({
                title:'Select your Region',
                templateUrl:'templates/regionPopup.html',
                scope: $scope,
                buttons: [
                    { text: 'Accept',
                      type: 'button-positive',
                        onTap: function(e) {
                            if($scope.data.userRegion == 'br') {
                                $scope.regionName = 'Brazil'
                            } else if ($scope.data.userRegion == 'eune') {
                                $scope.regionName = 'Europe Nordic & East'
                            } else if ($scope.data.userRegion == 'euw') {
                                $scope.regionName = 'Europe West'
                            } else if ($scope.data.userRegion == 'lan') {
                                $scope.regionName = 'Latin America North'
                            } else if ($scope.data.userRegion == 'las') {
                                $scope.regionName = 'Latin America South'
                            } else if ($scope.data.userRegion == 'na') {
                                $scope.regionName = 'North America'
                            } else if ($scope.data.userRegion == 'oce') {
                                $scope.regionName = 'Oceania'
                            } else if ($scope.data.userRegion == 'ru') {
                                $scope.regionName = 'Russia'
                            } else if ($scope.data.userRegion == 'tr') {
                                $scope.regionName = 'Turkey'
                            } else if ($scope.data.userRegion == 'sea') {
                                $scope.regionName = 'South East Asia'
                            } else if ($scope.data.userRegion == 'kr') {
                                $scope.regionName = 'Republic of Korea'
                            } else {
                                $scope.regionName = null;
                            }

                        }
                    },
                    {
                        text: 'Cancel',
                        type: 'button-stable',
                        onTap: function(e) {
                            $scope.data.userRegion = null;
                            selectRegionPopup.close();
                        }
                    }
                ]
            });
        }

        function getLastMatches() {
              return summonerService.getSummoner($scope.data.userRegion, $scope.summonerInput)

                  // promise result of fetching summoner
                .then(function(result) {
                      $scope.summoner = result.data;
                      return summonerService.getLast5Games($scope.data.userRegion, _.pluck($scope.summoner, 'id'));
                })
                  // promise result of fetching user's last 5 games
                .then(function(result) {
                      $scope.matches = result.data.matches;

                      _.forEach($scope.matches, function(match) {
                          $scope.championsPromise.push(summonerService.getChampionById($scope.data.userRegion, match.champion));
                      });
                      return $q.all($scope.championsPromise);
                })
                  // promise result of fetching champions in matches
                .then(function(result) {
                      $scope.champions = result;
                      var championMatch;

                      _.forEach($scope.champions, function(champion) {
                          championMatch = _.find($scope.matches, { champion : champion.data.id});
                          if (championMatch) {
                              championMatch.championName = champion.data.name;
                              $scope.lastMatches.push(_.pick(championMatch, ['championName', 'lane', 'queue', 'timestamp']));
                          }
                      });
                      $scope.summonerInput = null;
                })
        }
    }
})();