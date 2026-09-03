# v1.0.0-beta.33

# - App Changelog

## Additions

-   **Added a live Ore UI Preview for color customizations in the config editor.** Using [xKingDark/OreUI-Viewer](https://github.com/xKingDark/OreUI-Viewer).
    -   This preview refreshes in real-time as you are changing color options, and unlike the preview on the Ore UI Customzier website, you can actually interact with this one and access other menus.
    -   This preview is also opened in a separate window, so you can put the config editor and preview window in side-by-side in split-screen to allow for easy customization.
    -   You are able to have multiple previews from multiple Minecraft versions running simultaneously.
    -   Currently this preview requires you to have Minecraft installed to use it (you don't need to own the game to use it, even if it is in trial mode it will still work). There are plans however to implement a way where if you don't have Minecraft installed, it can just download Ore UI files and use those.
-   **Implemented the themes tab.**
-   **Added an export config button to the config editor.**
-   Added a confirmation dialog to the discard changes button in the config editor.
-   Added a find dialog (`CTRL+F`).
-   The refresh button on the config and plugin details overlay page is now functional.
-   There is now an error message in the plugin details overlay page if the `min_engine_version` field of a plugin lists a version above the current Ore UI Customizer API version.
-   There is now a warning message in the config and plugin details overlay page if the config or plugin has a missing dependency.
-   Added a "Live Ore UI Preview Default Version Folder" option to the General tab of preferences.
-   Added an "Live Ore UI Preview - Use Version Folder Backup" option to the General tab of preferences.
-   Added four new panoramas:
    -   `Better Together`
    -   `Nether Update`
    -   `Update Aquatic`
    -   `Village & Pillage`
-   Added better errors while importing plugins and configs.
-   When an error occurs while importing a config or plugin, you can now click the toast message to see the config or plugin details overlay page.

## Changes

-   Reordered the panorama options.
-   Configs and plugins with no icon now show the default icon in the config and plugins details overlay page rather than the missing pack icon.
-   The config and plugins details overlay page now handles missing configs and plugins properly.

## Fixes

-   Fixed detection of Minecraft UWP beta builds (not previews, previews never had any issues) (this includes beta builds before 1.18.30 (when it switched to the preview system), and all dev builds (all dev builds use the beta system, including modern ones)).
-   Fixed an issue where certain really old Minecraft versions would be detected as a different version. For example, 0.12.0.1 Windows 10 Edition Beta was detection as 0.1.2.1.
-   Fixed the GUI Scale being missing from the Top debug overlay.
-   Fixed a typo where the `Trails & Tales` panorama was called `Trails and Tales`.
-   Fixed a bug where many images in the UI of the app were draggable when they shouldn't be.

# - Customizer Changelog

## Critical Fixes

-   Fixed a bug where featured servers in the Lite Play Screen could not be joined.

## Additions

-   **Added Themes!**
    -   Themes are like resource packs for Ore UI. Themes have all the same color replacements options that configs do, but they also have additional features, such as:
        -   Themes allow you to define custom CSS for Ore UI.
        -   Themes allow you to replace textures, videos, and fonts in Ore UI.
-   **Added many new color replacements options.**
    -   Added two new sections to the Colors tab of the config editor:
        -   `Special Color Options`
        -   `menus-theme.css`
    -   These two new sections contain a total of 29 new color options.
    -   These new color options are actually just split from the already existing color options, before these options were controlled by the already existing color options, but there was no way to change specifically these ones without also affecting every other thing that uses that color, so now these can be changed independently from the other areas.
    -   All the previous color options still exist and are now in the `Other Color Replacements` section.
    -   Older configs that don't define these new color options will automatically set these new color options based on the color options they were split from, resulting in the older configs looking indentical to how they did before.
-   **Added `The End` as a dimension option for the spawn dimension filter option.**

## Changes

-   Configs and plugins now have their JSON files parsed with JSON5, meaning comments and trailing commas are now supported.
-   The spawn biome options in the Debug tab can now be edited while the biome override option is enabled.
-   The `inject-into-routes` action of the built-in `facet-spy` plugin has been split off into a separate `lite-play-screen-routes` routes plugin, as the facet spy is being deprecated, so this way if it is disabled, the Lite Play Screen will still work.
-   Updated the descriptions of several options in the Debug tab.
-   Clarified that the read-only toggles in the Debug tab are only read-only because it is not possible to change them through the UI.
-   The `version` field of dependencies of plugins is no longer required.

## Fixes

-   Fixed a bug where the icon of the debug tab was blank.
-   Fixed a bug where color replacements could cascade.
-   Fixed editor mode detection for `editor-menu` and `editor-project`.

# v1.0.0-beta.32

# - App Changelog

## Breaking Changes

-   macOS 11 (Big Sur) is no longer supported due to updating from Electron v37.2.1 to v40.10.6.

## Additions

-   macOS builds are now signed and notarized.
-   Added support for automatic updates to macOS.
-   There is now a prompt to enable/disable automatic updates (on supported operating systems) (the prompt only appears once).
-   Added an "Enable Automatic Updates" option to the General tab of preferences.

## Changes

-   Made the OS and GPU strings in the "Top" and "Basic" debug overlays cleaner.
-   The CPU string in the "Basic" debug overlay now includes the number of cores.
-   The process and system uptimes in the "Basic" debug overlay are now formatted as `DD:HH:MM:SS` instead of just seconds.

## Fixes

-   Fixed automatic updates for Windows (this is a retroactive fix and affects all previous versions).

# v1.0.0-beta.31

# - App Changelog

## Additions

-   Added the `ouicconfig` and `ouicaddon` file type associations to macOS.

## Changes

-   Updated the Ore UI Customizer API to v1.16.0.

## Fixes

-   Fixed a bug where when importing a plugin it would say "Successfully imported 'undefined'" instead of including the actual plugin name.
-   Fixed the icons for the `ouicplugin` and `ouictheme` file type associations on macOS.

# - Customizer Changelog

## Additions

-   Added the export world button to non-Windows platforms, such as Android (in both the General and Debug tabs).
-   The Realms tab of the Lite Play Screen now automatically refreshes the list of realms when the realms list is loaded or updated.
-   The Realms tab of the Lite Play Screen now has a loading screen.
-   The Realms tab of the Lite Play Screen now allows you to edit realms that you don't own but have administrator access to.
-   The more menu of Realms in the Realms tab of the Lite Play Screen now has a button to open the Realm Hub for the Realm.
-   The Worlds tab of the Lite Play Screen now renders world icons.

## Changes

-   v1.26.40 is now fully supported!

## Fixes

-   When leaving a world, Realm, or server, the Lite Play Screen now correctly opens, rather than the vanilla play screen opening.
-   Fixed a typo in the more menu of Realms in the Realms tab of the Lite Play Screen where the "Realms Stories" button said "Realm Stories".
-   The more menu of Realms in the Realms tab of the Lite Play Screen now closes when a button in it is pressed.

## Technical Additions

-   The `QueryManager` class is now fully implemented.

# v1.0.0-beta.30

# - App Changelog

## Changes

-   Updated the Ore UI Customizer API to v1.15.0.

# - Customizer Changelog

## Critical Fixes

-   Fixed an issue where Ore UI screens that were in a file other than the index-#.js file in some Minecraft versions (ex. gameplay screens or Editor Mode) would freeze the game for a few seconds to minutes upon opening and would be completely blank.

## Additions

-   Added a fallback system for when the facet spy fails to inject or doesn't inject properly so that all the features still work without it. This also means if there is an error in the vanilla UI script file that it won't break things like the Router tab of the 8Crafter Utilities Main Menu or prevent you from copying errors in the console to your clipboard.
-   Added the ability for the Ore UI Customizer's menus/features to access facets before the game's UI script is loaded.

# v1.0.0-beta.29

# - App Changelog

## Additions

-   Added two new panoramas:
    -   `Tiny Takeover`
    -   `Chaos Cubed`

## Changes

-   Updated the Ore UI Customizer API to v1.14.0.

# - Customizer Changelog

## Additions

-   Added a scrollbar to the left sidebar of the 8Crafter Utilities Main Menu so that the buttons don't overflow or go offscreen when the window or screen size is small.

## Changes

-   v1.26.30 is now fully supported!
-   v1.26.30 previews are now fully supported!
-   v1.26.40.20-v1.26.40.26 previews are now fully supported!
-   The Lite Play Screen will now force fetch the realms list on newer versions of Minecraft when necessary.
-   The 8Crafter Utilities Main Menu can now be opened with both CTRL+ALT+M and CTRL+ALT+SHIFT+M, instead of only CTRL+ALT+M.
-   Many buttons in the 8Crafter Utilities Main Menu now have overflow wrapping.
-   The config display on the General tab of the 8Crafter Utilities Main Menu now uses the Consolas font and is placed on the line after the prefix, rather than on the same line.
-   The GitHub link in the About tab of the 8Crafter Utilities Main Menu has been changed from `https://github.com/8Crafter-Studios/8Crafter.github.io` to `https://github.com/8Crafter-Studios/Ore-UI-Customizer-App` as that is repository bugs should be reported to.

## Fixes

-   Fixed an issue where the scrollbar in the 8Crafter Utilities Main Menu would be sized incorrectly and not allow you to scroll all the way down when dragged manually instead of scrolling.

# v1.0.0-beta.28

# - App Changelog

## Additions

-   Added the path to the Windows LeviLauncher data folders to the default version folder search locations list (if you are updating from an older version of the app, the path will automatically be added to the list).

## Fixes

-   Fixed a bug where modifications to configs in the config editor screen could not be saved and threw an error upon clicking the save button.
-   Fixed a bug where the colors tab of the config editor screen had no logic to store modified options.
-   Fixed a bug where the raw config tab would not update until the config was saved.
-   Fixed a bug where other tabs would not update their options when the raw config data was edited until the config was saved.
-   Fixed a bug where the raw config editor could only

# v1.0.0-beta.27

# - App Changelog

## Fixes

-   Fixed a bug where the uninstall function did not work on Android builds.

# v1.0.0-beta.26

# - App Changelog

## Additions

-   Added Linux portable ZIP builds.
-   Added macOS DMG builds.
-   Added Linux builds for arm64 and armv7l.
-   Added additional app metadata:
    -   Copyright
    -   Category (macOS)
    -   Categories (Linux (RPM/DEB))
    -   Section (Linux (Debian-based))

## Changes

-   Changed the naming format of the Windows setup EXE builds.

## Fixes

-   Fixed the app icon on macOS and Linux.

# v1.0.0-beta.25

# - App Changelog

## Additions

-   Added full support for MCPELauncher.
-   Added support for extracted Android APKs (this means custom launchers that use Android builds instead of Windows builds are now supported).

# v1.0.0-beta.24

# - App Changelog

## Changes

-   Updated the Ore UI Customizer API to v1.13.0.

# - Customizer Changelog

## Performance

-   Major performance improvements to the "Modifying files..." step. It is now around at least 10-20x faster. (ex. On a slow Android VM, this update made the "Modifying files..." step go from taking over a minute to taking under 4 seconds, and on a fast PC it went from taking 4 seconds to taking a tiny fraction of a second.)

## Additions

-   The details panels of servers in the servers tab of the Lite Play Screen now display the ping status index.

## Fixes

-   The details panels of servers in the servers tab of the Lite Play Screen now correctly fetch the network server details.

# v1.0.0-beta.23

# - App Changelog

## Changes

-   Updated the Ore UI Customizer API to v1.12.1.

# - Customizer Changelog

## Critical Fixes

-   Fixed a bug where the game would throw a syntax error and be unable to load Ore UI in versions before the 1.26.20 previews.

# v1.0.0-beta.22

# - App Changelog

## Changes

-   Updated the Ore UI Customizer API to v1.12.0.

## Fixes

-   Miscellaneous bug fixes.

# - Customizer Changelog

## Additions

-   MASSIVE improvements to the console.
-   The console now has source map support.
-   Console timestamps now include a performance stamp.
-   The console now supports accessing recently selected elements through `$0`, `$1`, `$2`, `$3`, and `$4`.
-   The console now supports accessing the result of the last executed command through `$_`.
-   The console now supports many other DevTools utility variables in addition to the ones already mentioned.
    -   `$`
    -   `$$`
    -   `clear`
-   The element used to display the result of the execution in the console can now be accessed inside of the script with `$resultElem`.
-   If a script in the console returns the value of the `$noResultElemModificationsSymbol` variable, there will be no result element added to the console for that execution.
-   Complete overhaul to the rendering of objects and other expandable things in the console.
-   Added support for rendering properties that have symbol keys in the console.
-   Added more options to the console context menus.
-   Implemented some unimplemented console context menu options .
-   Many console rendering improvements.
-   Many other console improvements.
-   Added the `Stats Corner Debug Overlay`. It can be accessed through `CTRL + SHIFT + I`.
-   Added 3 new debug graphs. They can be accessed through `F3 + 2`, `F3 + 3`, and `F3 + 4` respectively.
    -   `Lagometer`
    -   `Event Loop Lag Graph`
    -   `Frame Callback Delay Graph`

## Changes

-   v1.26.0/1/2/3 is now fully supported!
-   v1.26.10/11/12/13 is now fully supported!
-   v1.26.0 previews are now fully supported!
-   v1.26.10 previews are now fully supported!
-   v1.26.20.20-v1.26.20.27 previews are now fully supported!
-   Major code refactoring.
-   In Minecraft v1.26.10+ the button for the featured tab of the Lite Play Screen now shows the server count as `<Creator Experiences>+<Featured Experiences>`
-   In Minecraft v1.26.10+ the buttons for servers in the featured tab of the Lite Play Screen now show whether the server is a Creator Experience or a Featured Experience.
-   Added more data to the details panels of servers on the Lite Play Screen.
    -   IP
    -   Type
    -   Is Supported for Party Travel
-   Major in-game API changes. You can see the updated API in the generated `.d.ts` files that will be in your modded `gui` folder.

## Fixes

-   Bug fixes for console execution history.
-   Bug fixes for multiple console context menu actions.
-   The details panes of friends worlds now correctly display the max player count.

## Security Fixes

-   Fixed a security vulnerability where when opening the details panel of a server on the Lite Play Screen, it would display the MOTD as HTML, which could allow the MOTD to be used to execute scripts (not on your computer, but in Ore UI).

# v1.0.0-beta.21

## Changes

-   Updated the Ore UI Customizer API to v1.11.0.

    -   ### Critical Fixes

        -   Fixed a bug where the debug tab would throw errors upon being accessed.

    -   ### Performance

        -   Fixed a bug that was causing Ore UI screens to take about 3 seconds to load instead of loading almost instantly.

# v1.0.0-beta.20

## Additions

-   Added two new panoramas:
    -   `Copper Age`
    -   `Mounts of Mayhem`
-   Added a `Latest` panorama option, which makes the panorama always use the panorama for the latest release of Minecraft.
-   Added a feature where when a Minecraft GDK auto-update corrupts the installation of the Ore UI Customizer on that version, the app can detect it and show that it is corrupted, and it has a button to repair it for you.
-   Added a button to open the Customizer's data folder to the `Help` menu in the menu bar.
-   Added a button to open the link to the app's GitHub repository to the `Help` menu in the menu bar.
-   When hovering over a the version number cell of an installation in the installations list, it now shows the path to the corresponding version folder in the hover title text.
-   Added the ability for the app to read `MicrosoftGame.Config` files when no `AppXManifest.xml` file is present.

## Removals

-   Removed the `Test Toggle` from the `General` tab of preferences.

## Performance

-   When applying the modded Ore UI files, it now uses parallelization to dramatically speed up the process of writing the modified files.

# v1.0.0-beta.19

## Changes

-   Updated the Ore UI Customizer API to v1.11.0.

    -   ### Additions

        -   Multi-file plugins now have access to two new constants that are basically modules:

            -   `customizerEnv`
            -   `pluginEnv`

            These allow the plugin to access files from inside of itself, to allow it to load assets included in the plugin and inject them into the Ore UI files, as well as seeing details about the Ore UI Customizer (ex. if it is running in the website, app, or CLI, and the version), and being able to modify the Ore UI Customizer's settings in actions that use the `global_before` context.  
            The types for these can be found in the [`@ore-ui-customizer-api/plugin-env`](https://www.npmjs.com/package/@ore-ui-customizer-api/plugin-env) NPM package.  
            To use it in your plugin just install the package and put the following at the top of your plugin's main TypeScript file: `import type {} from "@ore-ui-customizer-api/plugin-env";`  
            Note: These constants are only available in Ore UI Customizer v1.11.0+, to maintain backwards compatibility it is recommended to check if the constants exist with `typeof customizerEnv !== "undefined"` before acessing them.

    -   ### Fixes

        -   Listing a built-in plugin as a dependency of a plugin now forcefully enables that built-in plugin, the version field of built-in plugin dependencies is ignored.

        -   #### Website Version

            -   The `Import Plugin` button now also supports multi-file plugins with the `.ouicplugin` file extension instead of only `.mcouicplugin`.
            -   Multi-file plugins are now functional.
            -   Fixed the "v1.21.120/121 (PC)" preset.

# v1.0.0-beta.18

## Additions

-   The app now notifies you when opened if an update is available.

## Changes

-   Updated the Ore UI Customizer API to v1.10.0.

    -   ### Additions

        -   The Customizer now provides cached values for queries from the game if the game does not provide a response, this allows reloading to not break everything in 1.21.130+, if the game never provided a value for it to cache, it will use some fake premade values to make it work.
        -   The special context menus for strings, numbers, symbols, undefined, null, and booleans can now be used on ones logged at the top level (not within an expanded object).

    -   ### Changes

        -   The console can now display uncaught errors that were recieved as a multiple parameters instead of an instance of `ErrorEvent` from `window.onerror`.
        -   Increased the default console execution history limit from `10` to `100`.
        -   Strings logged in the console are now dynamically quoted when the first item in that log is not a string, to match DevTools.
        -   The `Copy console` option in the console context menu now inserts newlines in between each console message.

    -   ### Fixes

        -   Fixed a bug where uncaught exceptions and promise rejections used the background color for errors in the console instead of their own unique background colors.
        -   Fixed a bug where the `Copy object as JSONB literal` and `Copy object as JSONB literal (+non-enumerable)` options in the console context menu for top-level objects did not copy functions.
        -   Fixed wrapping for console messages that had multiple items.
        -   Logged empty strings now actually add an extra space in the console, to match DevTools.
        -   Fixed a bug where the `Copy console` option in the console context menu would always be disabled.

    -   ### Technical Additions

        -   Added new debug settings for intercepting and caching the following:
            -   Calls to commands in `window.__commands__` (enabled by running `localStorage.setItem("setting:__CACHING_VANILLA_COMMAND_CALLS_ENABLED__", "true")` in the console)
            -   Calls and responses of requests for queries (enabled by running `localStorage.setItem("setting:__CACHING_ENGINE_QUERY_RESULTS_FROM_HOOK_ENABLED__", "true")` in the console)

# v1.0.0-beta.17

## Critical Fixes

-   The Ore UI Customizer now distinguishes between different versions for vanilla Ore UI backups even if they have the same path.

## Changes

-   Updated the Ore UI Customizer API to v1.9.0.

    -   ### Critical Fixes

        -   Fixed a Minecraft bug where when reloading Ore UI it would cause the UI to be non-interactable (this also fixed the lite play screen).

    -   ### Additions

        -   Added a context menu to the console and its messages with many new very useful options, including but not limited to:
            -   Copying string contents
            -   Copying the stack of any console message.
            -   Copying any object as JSON or JSONB (JSON with support for functions, bigints, undefined, Infinity, -Infinity, NaN,
                etc.).
        -   Added much more descriptive error messages for many features, including the Auto Rejoiner.
        -   Made the links in the 8Crafter Utilities menu clickable (they now actually open in your web browser).

        -   #### Website Version

            -   Added the "v1.21.111 (PC)" preset.
            -   Added the "v1.21.113/114 (PC)" preset.
            -   Added the "v1.21.120/121 (PC)" preset.

    -   ### Changes

        -   Reworked the way properties are determined where to be shown in expanded objects in the console (properties from the objects
            prototype are now only shown in `[[Prototype]]` instead of also directly within the main object expansion (enumerable
            prototype properties are still always shown)).
        -   Load time and performance improvements to the lite play screen.

    -   ### Fixes

        -   Fixed a bug where disabled buttons in the 8Crafter Utilities menu were just gray outlines.
        -   Fixed a bug where there would be a console error saying `Failed to enable lite play screen, timed out.` when in-game,
            even when the lite play screen was disabled.
        -   Fixed a bug where the `Copy localStorage` button in the Debug tab of the 8Crafter Utilities menu would only copy the
            most recently set `localStorage` value.
        -   Fixed a bug where the console would add borders between adjacent messages with different colored backgrounds instead of adjacent
            ones with the same colored backgrounds.
        -   Fixed a bug where the information icon on expanded values in the console was invisible.
        -   Minor performance improvements and bug fixes.

    -   ### Technical Additions

        -   Documented many more types of native Ore UI things.

-   The backup folders now have a file storing their associated Minecraft versions in the `associatedMCVersion.json` file.

# v1.0.0-beta.16

## Additions

-   Added a `View Failures` button to the 3-dots menu of installations.

## Changes

-   Updated the Ore UI Customizer API to v1.8.0.

    -   ### Additions

        -   Added the ability for the console to display unhandled exceptions and promise rejections.
        -   The console can now display `console.info` logs, they are displayed in an emerald green color.
        -   The console execution history now persists across Ore UI reload (it persists until the game is fully restarted).
        -   The console now has special handling for displaying errors. It displays the error type, message, and stack instead of an error
            object, but can still be clicked on to be expanded to see the contents of the error object.
        -   When executing code in the console and the result of that code is a symbol, the console will now display that symbol instead of
            `undefined`.
        -   When executing code in the console, if the code throws an error that is an object or function, the console now displays it as an
            expandable object/function instead of `[object Object]` of the result of the function's
            `toString()` method.
        -   Console messages sent before the console was loaded are now displayed in the console.
        -   Console messages now have word wrapping enabled so they don't go off of the screen.
        -   Added the `CTRL + F8` keyboard shortcut to reload the UI.
        -   Added 3 new tabs to the 8Crafter Utilities menu:
            -   Router
            -   Debug
            -   Dev
        -   Added the list of keyboard shortcuts to the About tab of the 8Crafter Utilities menu.
        -   Added the "Enable Lite Play Screen (No Reload)" button to the "Performance" tab of the 8Crafter Utilities menu, this allows you
            to enable the lite play screen in a way where it doesn't reload the play screen when it opens, resulting in it opening faster,
            but at the cost of performance, as it doesn't unload the scripts from the vanilla play screen.

    -   ### Changes

        -   v1.21.120 is now fully supported!
        -   The `Small Corner Debug Overlay` has been reworked to update on keyboard and mouse events, have a lot more new
            information, and many other improvements.
        -   The keyboard shortcuts are now a lot more strict, they now only trigger if you are holding the key combo without any other
            additional modifier keys.
        -   When the `oreUICustomizer8CrafterConfig.js` file is missing, the config and version now say that they are missing in
            the General tab of the 8Crafter Utilities menu.

    -   ### Fixes

        -   Fixed a bug where the Lite Play Screen would enter into a reload-loop when enabled in Minecraft versions 1.21.110 and above.
        -   Fixed a bug where the Lite Play Screen was completely broken in Minecraft versions 1.21.120 and above.
        -   Fixed a few bugs with the code of a few of a buttons of the 8Crafter Utilities menu (some of the buttons had quotation marks in
            their `onclick` events).

    -   ### Technical Additions

        -   Added many new functions and global variables for messing with Ore UI and accessing facets.
        -   Added multiple new type declaration files and documented many more types of native Ore UI things.

    -   ### Notes

        -   In 1.21.120 and above, the Lite Play Screen causes the title bar at the top of the screen to be unable to be interacted with, as
            well as any vanilla menus entered through the screen, and the screen cannot be exited.\
            This happens with anything that reloads Ore UI (ex. `CTRL + F8`). It is a bug with that version of Minecraft.\
            There is a workaround though, whenever this bug occurs, just use a controller and press a key on it, then press an arrow key on
            your keyboard, and that fixes it.
        -   In the No Reload mode of the Lite Play Screen, clicking on any tab other than worlds causes the UI to crash, as it causes an
            error with one of the vanilla play screen functions (since they are not unloaded because it isn't reloaded).

-   When parts of an installation fail, the installation now is marked as a partially failed installation.
-   When an error occurs while uninstalling the Ore UI Customizer from a version, there is now a popup dialog with the error message.

# v1.0.0-beta.15

## Additions

-   Added the path to the Minecraft Windows full release GDK version's data folder to the default version folder search locations list (if you are updating from an older version of the app you will need to manually add `%appdata%/../../../../XboxGames/Minecraft for Windows` into the version folder search locations list in `Preferences > Installing`.

## Fixes

-   Fixed a bug where the app could not read the `appxmanifest.xml` files of the full release GDK version of Minecraft.

# v1.0.0-beta.14

## Additions

-   Added the path to the Minecraft Windows GDK version's data folder to the default version folder search locations list (if you are updating from an older version of the app you will need to manually add `%appdata%/../../../../XboxGames/Minecraft Preview for Windows` into the version folder search locations list in `Preferences > Installing`.

## Fixes

-   Fixed a bug where the app could not read the `appxmanifest.xml` files of the GDK version of Minecraft.

# v1.0.0-beta.13

## Changes

-   Updated the Ore UI Customizer API to v1.6.0.
    -   Made the Ore UI Customizer fully functional on the 1.21.110.25 preview and the 1.21.110.26 preview.

## Fixes

-   Fixed a bug where two windows would be opened instead of one when opening the app.

# v1.0.0-beta.12

## Changes

-   Updated the Ore UI Customizer API to v1.5.0.
    -   Fixed a bug where experimental toggles could not be enabled.
-   Changed the title image.

# v1.0.0-beta.11

## Additions

-   Added the app version, API version, env, process uptime, and system uptime to the basic mode debug overlay.

## Changes

-   Changed the file name format of the windows setup EXE.

## Fixes

-   Fixed a bug where the about window was missing an icon.
-   Fixed a bug where the panoramas were broken.
-   Fixed a bug where the `Config` option was missing from the debug HUD dropdown.
-   Fixed a bug where the router history would not be cleared when clicking on a sidebar button.
-   Fixed a bug where the basic mode debug overlay would leave behind bits of text that should have been removed.

# v1.0.0-beta.10

## Additions

-   Added a new debug overlay mode: config.
-   Added a panorama.
-   The customizer now can detect if a version is missing a GUI folder but has a backup, and has a button to restore the GUI folder from that backup.
-   Added support for the global and global_before plugin action contexts.

## Changes

-   Updated the Ore UI Customizer API to v1.4.0.
-   The basic debug overlay now updates immediately upon window resize.

## Fixes

-   Fixed a bug where the GUI folder was not detected on Linux and macOS.
-   Fixed a bug where there was no toast when importing a plugin.
-   Fixed a bug where when importing a plugin, it was not checked to see if it was a duplicate before importing it.
-   Fixed a bug where .ouicplugin plugin files would not load.

# v1.0.0-beta.9

-   Updated the Ore UI Customizer API to v1.3.1.

# v1.0.0-beta.8

## Additions

-   Added an F3 debug screen overlay.
-   Added the ability to open DevTools with F12 instead of only CTRL+SHIFT+I.
-   Added a debug tab to preferences, it has a dropdown to the debug HUD mode, as well as buttons to open certain folders and a list of certain folder paths.
-   The marketplace tab now has a special screen for when there is no internet connection, it also now has a loading screen.

## Changes

-   Buttons in button groups now have their hover animation also activate when hovering over their borders.
-   Spacing and sizing changes to the preferences and config editor menus.

## Fixes

-   Fixed a bug where the DevTools window was opened for the progress bar windows when installing the Ore UI Customizer on a Minecraft version.
-   Fixed a bug where the menu bar used the default menu bar instead of the custom one on macOS.

# v1.0.0-beta.7

-   Fixed a bug where the app data folder path was messed up on windows.

# v1.0.0-beta.6

-   Disabled the auto updater for macOS.

# v1.0.0-beta.5

-   Fixed a bug where the app would not run on macOS.

# v1.0.0-beta.4

-   Fixed a bug where the app would throw an error on startup if the app's app data folder did not already exist.

# v1.0.0-beta.3

-   Fixed a bug where the zip namespace was not defined, causing many things to throw errors.
-   Fixed a bug where configs and plugins could not be imported by double clicking them in file explorer unless the app was already open.

# v1.0.0-beta.2

-   Fixed a bug where the +/- icons on the collapsible section buttons did not scale with the GUI scale.
-   Fixed a bug where changes made to the metadata section of the edit config screen were not saved.
-   Fixed a bug where plugins and configs could not be imported by opening their file from file explorer.
-   Fixed a bug where the sections of the edit config screen had their structure completely broken whenever the config changes were saved or discarded.
-   Fixed a bug where the default config icon was the default plugin icon instead.

# v1.0.0-beta.1

-   Initial release
