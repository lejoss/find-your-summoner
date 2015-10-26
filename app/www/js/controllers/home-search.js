(function () {
    'use strict';

    angular
        .module('league-finder')
        .controller('HomeSearch', HomeSearch);

    HomeSearch.$inject = ['$scope', '$ionicPopup', 'leagueService', '$q'];

    function HomeSearch($scope, $ionicPopup, leagueService, $q) {

        $scope.vm                    = [];   // view model used to display card data on screen

        $scope.summoner              = null; // summoner details
        $scope.summonerInput         = null; // input used to query summoners data
        $scope.data                  = {
            userRegion: null
        };

        // raw lists for transform
        $scope.matches               = [];   // raw list of summoner's matches when promise resolved
        $scope.detailMatches         = [];   // raw list of summoner's detail matches when promise resolved
        $scope.champions             = [];   // raw list of champions involved in last games when promise resolved
        $scope.stats                 = [];   // raw list of stats from the last matches

        // hardcoded list
        $scope.regions               = [
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
        $scope.selectRegion         = selectRegion;
        $scope.getLastMatches       = getLastMatches;

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
                            _.filter($scope.regions, function(region) {
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

          return leagueService.getSummoner($scope.data.userRegion, $scope.summonerInput)
              // promise result of fetching summoner
            .then(function(result) {
                  $scope.summoner = result.data;
                  $scope.summonerId = _.pluck($scope.summoner, 'id');

                  return leagueService.getLast5Games($scope.data.userRegion, $scope.summonerId);
            })
              // promise result of fetching summoner's last matches
            .then(function(result) {
                  $scope.matches = result.data.matches;
                  var matchPromises = [];

                  $scope.matches =
                      _.map($scope.matches, function (match) {
                          matchPromises.push(leagueService.getMatchDetails($scope.data.userRegion, match.matchId));
                          return {
                              matchId: match.matchId,
                              champion: match.champion,
                              lane: match.lane,
                              queue: match.queue,
                              timestamp: match.timestamp
                          }
                      });

                  return $q.all(matchPromises);
            })
              // promise result of fetching match details
            .then(function(result) {
                  $scope.detailMatches = result;
                  var stats = [];
                  var championPromises = [];
                  var currentParticipantId;

                  _.map($scope.detailMatches, function (match) {

                      // summoner current Id in match
                      currentParticipantId =
                          _.pluck(_.filter(match.data.participantIdentities, function (participant) {
                              return participant.player.summonerId == $scope.summonerId;
                      }), 'participantId').join();

                      // get stats for current participant in match
                      _.filter(match.data.participants, function (participant) {
                          if(participant.participantId == currentParticipantId) {
                              stats.push({
                                  matchId: match.data.matchId,
                                  winner: participant.stats.winner,
                                  kills: participant.stats.kills,
                                  deaths: participant.stats.deaths,
                                  assists: participant.stats.assists,
                                  minionsKilled: participant.stats.minionsKilled,
                                  champLevel: participant.stats.champLevel
                              });
                          }
                      });
                  });
                  $scope.stats = stats;
                  stats = null;

                  // from summoner match get champion played
                  _.forEach($scope.matches, function(match) {
                      championPromises.push(leagueService.getChampionById($scope.data.userRegion, match.champion));
                  });

                  return $q.all(championPromises);
              })
              // promise result of fetching used champions in last matches
            .then(function(result) {
                  $scope.champions = result;

                  // last champions played
                  $scope.champions =
                      _.map($scope.champions, function(champ) {
                          return {
                              champId: champ.data.id,
                              champName: champ.data.name,
                              champTitle: champ.data.title
                          }
                      });

                  var matchWithStats =
                      _.map($scope.matches, function(match) {
                          return _.extend(match, _.omit(_.findWhere($scope.stats, { matchId: match.matchId}), 'matchId'));
                      });

                  // vm = view model
                  $scope.vm =
                      _.map(matchWithStats, function(match) {
                          return _.extend(match, _.omit(_.findWhere($scope.champions, { champId: match.champion }), 'champId'));
                      });

                  console.log($scope.vm);
                  matchWithStats = null;
                  $scope.summonerInput = null;
            })
            .catch();
        }
    }
})();