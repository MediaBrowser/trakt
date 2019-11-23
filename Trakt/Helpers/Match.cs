using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using MediaBrowser.Controller.Entities;
using MediaBrowser.Controller.Entities.TV;
using MediaBrowser.Model.Entities;
using Trakt.Api.DataContracts.BaseModel;
using Trakt.Api.DataContracts.Users.Collection;
using Trakt.Api.DataContracts.Users.Playback;
using Trakt.Api.DataContracts.Users.Watched;

namespace Trakt.Helpers
{
    class Match
    {
        public static TraktShowWatched FindMatch(Series item, IEnumerable<TraktShowWatched> results)
        {
            return results.FirstOrDefault(i => IsMatch(item, i.show));
        }

        public static TraktPlaybackEpisode FindMatch(Episode item, IEnumerable<TraktPlaybackEpisode> results)
        {
            return results.FirstOrDefault(i => IsMatch(item, i.episode));
        }

        public static Series FindMatch(TraktShow item, IEnumerable<Series> results)
        {
            return results.FirstOrDefault(i => IsMatch(i, item));
        }

        public static TraktShowCollected FindMatch(Series item, IEnumerable<TraktShowCollected> results)
        {
            return results.FirstOrDefault(i => IsMatch(item, i.show));
        }

        public static TraktMovieWatched FindMatch(BaseItem item, IEnumerable<TraktMovieWatched> results)
        {
            return results.FirstOrDefault(i => IsMatch(item, i.movie));
        }

        public static TraktPlaybackMovie FindMatch(BaseItem item, IEnumerable<TraktPlaybackMovie> results)
        {
            return results.FirstOrDefault(i => IsMatch(item, i.movie));
        }

        public static IEnumerable<TraktMovieCollected> FindMatches(BaseItem item, IEnumerable<TraktMovieCollected> results)
        {
            return results.Where(i => IsMatch(item, i.movie)).ToList();
        }

        public static IEnumerable<BaseItem> FindMatches(TraktMovieCollected item, IEnumerable<BaseItem> results)
        {
            return results.Where(i => IsMatch(i, item.movie)).ToList();
        }

        public static bool IsMatch(BaseItem item, TraktMovie movie)
        {
            var imdb = item.GetProviderId(MetadataProviders.Imdb);

            if (!String.IsNullOrWhiteSpace(imdb) &&
                String.Equals(imdb, movie.ids.imdb, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            var tmdb = item.GetProviderId(MetadataProviders.Tmdb);

            if (movie.ids.tmdb.HasValue && String.Equals(tmdb, movie.ids.tmdb.Value.ToString(CultureInfo.InvariantCulture), StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            if (item.Name == movie.title && item.ProductionYear == movie.year)
            {
                return true;
            }

            return false;
        }

        public static bool IsMatch(BaseItem item, TraktShow show)
        {
            return
            MatchIds(item.GetProviderId(MetadataProviders.Tvdb), show.ids.tvdb) ||
            MatchIds(item.GetProviderId(MetadataProviders.Imdb), show.ids.imdb) ||
            MatchIds(item.GetProviderId(MetadataProviders.Tmdb), show.ids.tmdb) ||
            MatchIds(item.GetProviderId(MetadataProviders.TvRage), show.ids.tvrage);

        }

        public static bool IsMatch(BaseItem item, TraktEpisode episode)
        {
            return
            MatchIds(item.GetProviderId(MetadataProviders.Tvdb), episode.ids.tvdb) ||
            MatchIds(item.GetProviderId(MetadataProviders.Imdb), episode.ids.imdb) ||
            MatchIds(item.GetProviderId(MetadataProviders.Tmdb), episode.ids.tmdb) ||
            MatchIds(item.GetProviderId(MetadataProviders.TvRage), episode.ids.tvrage);

        }

        public static bool MatchIds(string a, string b)
        {
            return !string.IsNullOrWhiteSpace(a) && string.Equals(a, b, StringComparison.OrdinalIgnoreCase);
        }

        public static bool MatchIds(string a, int? b)
        {
            return !string.IsNullOrWhiteSpace(a)
                   && b.HasValue
                   && string.Equals(a, b.Value.ToString(), StringComparison.OrdinalIgnoreCase);
        }
    }
}
