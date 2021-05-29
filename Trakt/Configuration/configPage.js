define([
  "jQuery",
  "loading",
  "emby-input",
  "emby-button",
  "emby-select",
  "emby-checkbox",
], function ($, loading) {
  "use strict";

  Array.prototype.remove = function () {
    var what,
      a = arguments,
      L = a.length,
      ax;
    while (L && this.length) {
      what = a[--L];
      while ((ax = this.indexOf(what)) !== -1) {
        this.splice(ax, 1);
      }
    }
    return this;
  };

  var TraktConfigurationPage = {
    pluginUniqueId: "8abc6789-fde2-4705-8592-4028806fa343",
    loadConfiguration: function (userId, form) {
      ApiClient.getPluginConfiguration(
        TraktConfigurationPage.pluginUniqueId
      ).then(function (config) {
        var currentUserConfig = config.TraktUsers.filter(function (curr) {
          return curr.LinkedMbUserId == userId;
        })[0];
        var formElements = document.querySelector(
          "#traktConfigurationForm"
        ).elements;
        // User doesn't have a config, so create a default one.
        if (!currentUserConfig) {
          // You don't have to put every property in here, just the ones the UI is expecting (below)
          currentUserConfig = {
            PIN: "",
            SkipUnwatchedImportFromTrakt: true,
            PostWatchedHistory: true,
            SyncCollection: true,
            ExtraLogging: false,
            ExportMediaInfo: false,
          };
        }

        // Default this to an empty array so the rendering code doesn't have to worry about it
        currentUserConfig.LocationsExcluded =
          currentUserConfig.LocationsExcluded || [];

        formElements.txtTraktPIN.value = currentUserConfig.PIN;
        formElements.chkSkipUnwatchedImportFromTrakt.checked =
          currentUserConfig.SkipUnwatchedImportFromTrakt;
        formElements.chkPostWatchedHistory.checked =
          currentUserConfig.PostWatchedHistory;
        formElements.chkSyncCollection.checked =
          currentUserConfig.SyncCollection;
        formElements.chkExtraLogging.checked = currentUserConfig.ExtraLogging;
        formElements.chkExportMediaInfo.checked =
          currentUserConfig.ExportMediaInfo;
        // List the folders the user can access
        ApiClient.getVirtualFolders(userId).then(function (virtualFolders) {
          TraktConfigurationPage.loadFolders(currentUserConfig, virtualFolders, form);
        });

        loading.hide();
      });
    },
    populateUsers: function (users, userSelect) {
      userSelect.innerHTML = "";
      for (var i = 0, length = users.length; i < length; i++) {
        var user = users[i];
        var opt = document.createElement("option");
        opt.value = user.Id;
        opt.text = user.Name;
        userSelect.add(opt);
      }
    },
    loadFolders: function (currentUserConfig, virtualFolders, form) {
      var traktLocationElem = form.querySelector('#divTraktLocations');
      var html = "";
      html += '<div data-role="controlgroup">';
      for (var i = 0, length = virtualFolders.length; i < length; i++) {
        var virtualFolder = virtualFolders[i];
        html += TraktConfigurationPage.getFolderHtml(
          currentUserConfig,
          virtualFolder,
          i
        );
      }
      html += "</div>";
      traktLocationElem.innerHTML = html;
      // How to trigger this without jQuery?
      $(traktLocationElem).trigger("create");
    },
    getFolderHtml: function (currentUserConfig, virtualFolder, index) {
      var html = "";
      for (
        var i = 0, length = virtualFolder.Locations.length;
        i < length;
        i++
      ) {
        var location = virtualFolder.Locations[i];
        var isChecked = currentUserConfig.LocationsExcluded.filter(function (
          current
        ) {
          return current.toLowerCase() == location.toLowerCase();
        }).length;
        var checkedAttribute = isChecked ? 'checked="checked"' : "";
        html +=
          '<label><input is="emby-checkbox" class="chkTraktLocation" type="checkbox" data-mini="true" name="trakt_location"' +
          ' value="' +
          location +
          '" ' +
          checkedAttribute +
          " /><span>" +
          location +
          "</span></label>";
      }
      return html;
    },
  };

  function onSubmit(ev) {
    ev.preventDefault();
    loading.show();

    var form = ev.currentTarget;

    var currentUserId = form.elements.selectUser.value;
    var locationsExcluded = Array.from(
      document.getElementsByName("trakt_location")
    )
      .filter(function (checkbox) {
        return checkbox.checked;
      })
      .map(function (checkbox) {
        return checkbox.value;
      });

    ApiClient.getPluginConfiguration(
      TraktConfigurationPage.pluginUniqueId
    ).then(function (config) {
      console.log({
        config,
        currentUserId,
        traktPIN: form.elements.txtTraktPIN.value,
        locationsExcluded,
        skipUnwatchedImportFromTrakt:
          form.elements.chkSkipUnwatchedImportFromTrakt.checked,
        postWatchedHistory: form.elements.chkPostWatchedHistory.checked,
        syncCollection: form.elements.chkSyncCollection.checked,
        extraLogging: form.elements.chkExtraLogging.checked,
        exportMediaInfo: form.elements.chkExportMediaInfo.checked,
      });

      var currentUserConfig = config.TraktUsers.filter(function (user) {
        return user.LinkedMbUserId == currentUserId;
      })[0];
      // User doesn't have a config, so create a default one.
      if (!currentUserConfig) {
        currentUserConfig = {};
        config.TraktUsers.push(currentUserConfig);
      }

      currentUserConfig.SkipUnwatchedImportFromTrakt =
        form.elements.chkSkipUnwatchedImportFromTrakt.checked;
      currentUserConfig.PostWatchedHistory =
        form.elements.chkPostWatchedHistory.checked;
      currentUserConfig.SyncCollection =
        form.elements.chkSyncCollection.checked;
      currentUserConfig.ExtraLogging = form.elements.chkExtraLogging.checked;
      currentUserConfig.ExportMediaInfo =
        form.elements.chkExportMediaInfo.checked;
      currentUserConfig.PIN = form.elements.txtTraktPIN.value;
      currentUserConfig.LinkedMbUserId = currentUserId;
      currentUserConfig.LocationsExcluded = locationsExcluded;

      if (currentUserConfig.UserName == "") {
        config.TraktUsers.remove(config.TraktUsers.indexOf(currentUserConfig));
      }
      ApiClient.updatePluginConfiguration(
        TraktConfigurationPage.pluginUniqueId,
        config
      ).then(function (result) {
        Dashboard.processPluginConfigurationUpdateResult(result);
        ApiClient.getUsers().then(function (users) {
          var currentUserId = form.elements.selectUser.value;
          TraktConfigurationPage.populateUsers(users, form.elements.selectUser);
          form.elements.selectUser.value = currentUserId;
          TraktConfigurationPage.loadConfiguration(currentUserId, form);
          Dashboard.alert("Settings saved.");
        });
      });
    });

    return false;
  }

  return function (view) {
    var form = view.querySelector("#traktConfigurationForm");
    var userSelect = form.elements.selectUser;
    form.addEventListener("submit", onSubmit);

    userSelect.addEventListener("change", function (ev) {
      TraktConfigurationPage.loadConfiguration(ev.currentTarget.value, form);
    });

    view.addEventListener("viewshow", function () {
      loading.show();

      ApiClient.getUsers().then(function (users) {
        TraktConfigurationPage.populateUsers(users, userSelect);
        var currentUserId = userSelect.value;
        TraktConfigurationPage.loadConfiguration(currentUserId, form);
      });
    });
  };
});
