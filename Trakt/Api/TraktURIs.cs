namespace Trakt.Api
{
    public static class TraktUris
    {
        public const string Id = "c44548028dcd8f31e9bee55318562e6e5deb8524f5ca3e77e167fd3b1c9ce380";
        public const string Secret = "d453bc07bcf42f72e3915715a5275d99de8381ff007c84d20e89ed1070310c89";

        #region POST URI's

        public const string Token = @"https://api.trakt.tv/oauth/token";

        public const string SyncCollectionAdd = @"https://api.trakt.tv/sync/collection";
        public const string SyncCollectionRemove = @"https://api.trakt.tv/sync/collection/remove";
        public const string SyncWatchedHistoryAdd = @"https://api.trakt.tv/sync/history";
        public const string SyncWatchedHistoryRemove = @"https://api.trakt.tv/sync/history/remove";
        public const string SyncRatingsAdd = @"https://api.trakt.tv/sync/ratings";

        public const string ScrobbleStart = @"https://api.trakt.tv/scrobble/start";
        public const string ScrobblePause = @"https://api.trakt.tv/scrobble/pause";
        public const string ScrobbleStop = @"https://api.trakt.tv/scrobble/stop";
        #endregion

        #region GET URI's

        public const string WatchedMovies = @"https://api.trakt.tv/sync/watched/movies";
        public const string WatchedShows = @"https://api.trakt.tv/sync/watched/shows";
        public const string CollectedMovies = @"https://api.trakt.tv/sync/collection/movies?extended=metadata";
        public const string CollectedShows = @"https://api.trakt.tv/sync/collection/shows?extended=metadata";
        public const string PlaybackMovies = @"https://api.trakt.tv/sync/playback/movies";
        public const string PlaybackShows = @"https://api.trakt.tv/sync/playback/episodes";

        // Recommendations
        public const string RecommendationsMovies = @"https://api.trakt.tv/recommendations/movies";
        public const string RecommendationsShows = @"https://api.trakt.tv/recommendations/shows";

        #endregion

        #region DELETE 

        // Recommendations
        public const string RecommendationsMoviesDismiss = @"https://api.trakt.tv/recommendations/movies/{0}";
        public const string RecommendationsShowsDismiss = @"https://api.trakt.tv/recommendations/shows/{0}";

        #endregion
    }
}

