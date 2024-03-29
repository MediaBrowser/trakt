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

  var pluginUniqueId = "8abc6789-fde2-4705-8592-4028806fa343";

  function loadConfiguration(userId, form) {
    ApiClient.getPluginConfiguration(pluginUniqueId).then(function (config) {
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
      formElements.chkSyncCollection.checked = currentUserConfig.SyncCollection;
      formElements.chkExtraLogging.checked = currentUserConfig.ExtraLogging;
      formElements.chkExportMediaInfo.checked =
        currentUserConfig.ExportMediaInfo;
      // List the folders the user can access
      ApiClient.getVirtualFolders(userId).then(function (virtualFolders) {
        loadFolders(currentUserConfig, virtualFolders, form);
      });

      loading.hide();
    });
  }

  function populateUsers(users, userSelect) {
    userSelect.innerHTML = "";
    for (var i = 0, length = users.length; i < length; i++) {
      var user = users[i];
      var opt = document.createElement("option");
      opt.value = user.Id;
      opt.text = user.Name;
      userSelect.add(opt);
    }
  }

  function loadFolders(currentUserConfig, virtualFolders, form) {
    var traktLocationElem = form.querySelector("#divTraktLocations");
    var html = virtualFolders.reduce(function (acc, virtualFolder) {
      acc.push(getFolderHtml(currentUserConfig, virtualFolder));
      return acc;
    }, []);
    traktLocationElem.innerHTML = html.join("");
    // How to trigger this without jQuery?
    $(traktLocationElem).trigger("create");
  }

  function getFolderHtml(currentUserConfig, virtualFolder) {
    return virtualFolder.Locations.map(function (location) {
      var isChecked = currentUserConfig.LocationsExcluded.filter(function (
        current
      ) {
        return current && current.toLowerCase() === location.toLowerCase();
      }).length;
      var checkedAttribute = isChecked ? 'checked="checked"' : "";
      return (
        '<label class="emby-checkbox-label"><input is="emby-checkbox" class="chkTraktLocation"' +
        ' type="checkbox" data-mini="true" name="trakt_location"' +
        ' value="' + location + '" ' + checkedAttribute + " /><span>" + location + "</span></label>"
      );
    }).join("");
  }

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

    ApiClient.getPluginConfiguration(pluginUniqueId).then(function (config) {
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

      if (currentUserConfig.UserName === "") {
        config.TraktUsers.remove(config.TraktUsers.indexOf(currentUserConfig));
      }
      ApiClient.updatePluginConfiguration(pluginUniqueId, config).then(
        function (result) {
          Dashboard.processPluginConfigurationUpdateResult(result);
          ApiClient.getUsers().then(function (users) {
            var currentUserId = form.elements.selectUser.value;
            populateUsers(users, form.elements.selectUser);
            form.elements.selectUser.value = currentUserId;
            loadConfiguration(currentUserId, form);
            Dashboard.alert("Settings saved.");
          });
        }
      );
    });

    return false;
  }

  return function init(view) {
    var form = view.querySelector("#traktConfigurationForm");
    var userSelect = form.elements.selectUser;
    form.addEventListener("submit", onSubmit);

    userSelect.addEventListener("change", function (ev) {
      loadConfiguration(ev.currentTarget.value, form);
    });

    view.addEventListener("viewshow", function () {
      loading.show();

      ApiClient.getUsers().then(function (users) {
        populateUsers(users, userSelect);
        loadConfiguration(userSelect.value, form);
      });
    });
  };
});
