(function() {
	'use strict';
	angular
		.module('TADkit')
		.controller('StoryboardController', StoryboardController);

	function StoryboardController($window, $scope, Settings, Datasets, Overlays, Resources) {
		// WATCH FOR WINDOW RESIZE
		angular.element($window).on('resize', function(){ $scope.$apply(); });

		// SET DERIVED DATA AND ATTRIBUTES ON COMPONENTS
		var defaultIndex = 0; // ?? used in components and overlays OR use currentIndex?
		
		var particlesCount = $scope.currentModel.data.length / $scope.currentDataset.object.components;
		var particleSegments = $scope.currentStoryboard.components[defaultIndex].view.settings.chromatin.particleSegments;
		var segmentsCount = particlesCount * particleSegments;
		var chromosomeIndex = 0;
		if ($scope.currentDataset.object.chromosomeIndex) {
			chromosomeIndex = $scope.currentDataset.object.chromosomeIndex;	
		}
		var dataStart = $scope.currentDataset.object.chromStart[chromosomeIndex];
		var dataEnd = $scope.currentDataset.object.chromEnd[chromosomeIndex];
		var segmentLength = $scope.currentStoryboard.components[defaultIndex].view.settings.chromatin.segmentLength = $scope.currentDataset.object.resolution / particleSegments; // base pairs

		// SET INITIAL position
		var position = dataStart + parseInt((dataEnd - dataStart) * 0.5);
		$scope.settings.position = position;
		var currentParticle = Resources.getParticle(position, dataStart, dataEnd, particlesCount);
		$scope.settings.currentParticle = currentParticle; 

		// AND SEGMENT IT LIES WITHIN
		$scope.settings.segment = Math.floor( ($scope.settings.position - dataStart) / segmentLength);
		$scope.settings.segmentLower = $scope.settings.position - ($scope.settings.segment * 0.5);
		$scope.settings.segmentUpper = $scope.settings.position + ($scope.settings.segment * 0.5);

		// $scope.currentModel = Datasets.getDataset(); // already set in Main
		$scope.currentOverlays = Overlays.get(); // CHANGE TO USE $scope.overlays
		// $scope.currentOverlayIndex = $scope.currentOverlays.current.index;

		$scope.proximityMatrix = Resources.getProximityMatrix($scope.currentModel.data);

		angular.forEach( $scope.currentStoryboard.components, function(value, index) {
			var overlay;
			// if (value.object.dataset == "default") {
				if (value.object.type == "scene") {
					value.data = $scope.currentModel.data;
					value.overlay = $scope.currentOverlays.loaded[$scope.currentOverlays.current.index];
					// value.overlayIndex = $scope.currentOverlays.current.index;
					value.contacts = $scope.proximityMatrix;
					value.overlay.state = {};
					value.overlay.object.state.index = $scope.currentOverlays.current.index; // for track
				} else if (value.object.type == "track-slider") {
					value.view.viewpoint.segmentsCount = $scope.settings.segmentsCount;
				} else if (value.object.type == "track-genes" || value.object.type == "panel-inspector") {
					overlay = Overlays.getOverlayById("genes");
					value.view.settings.segmentsCount = $scope.settings.segmentsCount;
					value.data = overlay.data;
					value.overlay = overlay;
				} else if (value.object.type == "track-contacts") {
					value.data = $scope.proximityMatrix.distances;
					value.view.settings.segmentsCount = $scope.settings.segmentsCount;
				} else if (value.object.type == "track-wiggle") {
					overlay = Overlays.getOverlayById(value.object.dataset);
					value.view.settings.segmentsCount = $scope.settings.segmentsCount;
					value.data = overlay.data;
					value.overlay = overlay;
				} else {
					// other types of component...
				}
			// }
		});
		// console.log($scope.currentStoryboard);
	}
})();