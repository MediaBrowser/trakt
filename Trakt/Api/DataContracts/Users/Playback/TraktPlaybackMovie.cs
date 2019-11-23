using System;
using System.Collections.Generic;
using System.Text;
using Trakt.Api.DataContracts.BaseModel;

namespace Trakt.Api.DataContracts.Users.Playback
{
    public class TraktPlaybackMovie
    {
        public TraktMovie movie { get; set; }

        public float progress { get; set; }
    }
}
