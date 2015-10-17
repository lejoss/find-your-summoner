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

        $scope.matches            = [];     // raw list of summoner's matches
        $scope.champions          = [];     // raw list of champions involved in last games
        $scope.championPromises   = [];     // array of promises used to return $q.all()
        $scope.lastMatches        = [];     // array to be displayed on view
        $scope.regions            = [
            { name: "Brazil", value: "br" },
            { name: "Europe Nordic & East", value: "eune" },
            { name: "Europe West", value: "euw" },
            { name: "Latin America North", value: "lan" },
            { name: "Latin America South", value: "las" },
            { name: "North America", value: "na" },
            { name: "Oceania", value: "oce" },
            { name: "Russia", value: "ru" },
            { name: "Turkey", value: "tr" },
            { name: "South East Asia", value: "sea" },
            { name: "Republic of Korea", value: "kr" }
        ];  // lol regions

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
                            _.forEach($scope.regions, function(region) {
                                if (region.value == $scope.data.userRegion) {
                                    $scope.regionName = region.name
                                }
                            })
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
                          $scope.championPromises.push(summonerService.getChampionById($scope.data.userRegion, match.champion));
                      });
                      return $q.all($scope.championPromises);
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