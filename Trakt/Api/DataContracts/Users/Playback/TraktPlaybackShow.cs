using System;
using System.Collections.Generic;
using System.Text;
using Trakt.Api.DataContracts.BaseModel;

namespace Trakt.Api.DataContracts.Users.Playback
{
    public class TraktPlaybackEpisode
    {
        public TraktEpisode episode { get; set; }

        public float progress { get; set; }

        public DateTime paused_at { get; set; }
    }
}
