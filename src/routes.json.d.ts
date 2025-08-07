export interface RoutesJSON {
    $schema: "./8crafters-ore-ui-customizer-app-routes.schema.json";
    routes: [
        {
            fileName: "/index.html";
            defaultRoute: "/home";
            supportedRoutes: [
                {
                    route: "/home";
                    modes: ["left-sidebar"];
                    regexp: "^\\/home(?:\\/)?$";
                    params: [];
                    transition: "RouteInstantTransition";
                    data: {
                        sidebarButtonID: "home";
                    };
                },
                {
                    route: "/installations";
                    modes: ["left-sidebar"];
                    regexp: "^\\/installations(?:\\/)?$";
                    params: [];
                    transition: "RouteInstantTransition";
                    data: {
                        sidebarButtonID: "installations";
                    };
                },
                {
                    route: "/marketplace";
                    modes: ["left-sidebar"];
                    regexp: "^\\/marketplace(?:\\/)?$";
                    params: [];
                    transition: "RouteInstantTransition";
                    data: {
                        sidebarButtonID: "marketplace";
                    };
                },
                {
                    route: "/preferences";
                    modes: ["left-sidebar"];
                    regexp: "^\\/preferences(?:\\/)?$";
                    params: [];
                    transition: "RouteInstantTransition";
                    data: {
                        sidebarButtonID: "preferences";
                    };
                },
                {
                    route: "/theme-editor";
                    modes: ["left-sidebar"];
                    regexp: "^\\/theme-editor(?:\\/)?$";
                    params: [];
                    transition: "RouteInstantTransition";
                    data: {
                        sidebarButtonID: "theme-editor";
                    };
                },
                {
                    route: "/config-editor";
                    modes: ["left-sidebar"];
                    regexp: "^\\/config-editor(?:\\/)?$";
                    params: [];
                    transition: "RouteInstantTransition";
                    data: {
                        sidebarButtonID: "config-editor";
                    };
                },
                {
                    route: "/plugins";
                    modes: ["left-sidebar"];
                    regexp: "^\\/plugins(?:\\/)?$";
                    params: [];
                    transition: "RouteInstantTransition";
                    data: {
                        sidebarButtonID: "plugins";
                    };
                },
                {
                    route: "/themes";
                    modes: ["left-sidebar"];
                    regexp: "^\\/themes(?:\\/)?$";
                    params: [];
                    transition: "RouteInstantTransition";
                    data: {
                        sidebarButtonID: "themes";
                    };
                },
                {
                    route: "/configs";
                    modes: ["left-sidebar"];
                    regexp: "^\\/configs(?:\\/)?$";
                    params: [];
                    transition: "RouteInstantTransition";
                    data: {
                        sidebarButtonID: "configs";
                    };
                },
                {
                    route: "/plugin-details";
                    modes: ["overlay", "blocking-background", "close-overlay-on-background-click", "close-overlay-on-escape"];
                    regexp: "^\\/plugin-details(?:\\/)?$";
                    params: [];
                    transition: "RouteInstantTransition";
                },
                {
                    route: "/config-details";
                    modes: ["overlay", "blocking-background", "close-overlay-on-background-click", "close-overlay-on-escape"];
                    regexp: "^\\/config-details(?:\\/)?$";
                    params: [];
                    transition: "RouteInstantTransition";
                },
                {
                    route: "/theme-details";
                    modes: ["overlay", "blocking-background", "close-overlay-on-background-click", "close-overlay-on-escape"];
                    regexp: "^\\/theme-details(?:\\/)?$";
                    params: [];
                    transition: "RouteInstantTransition";
                },
                {
                    route: "/tutorial";
                    modes: [];
                    regexp: "^\\/tutorial(?:\\/)?$";
                    params: [];
                    transition: "RouteInstantTransition";
                },
                {
                    route: "/play/:tab/:id?/:type?";
                    modes: [];
                    regexp: "^\\/play\\/([^\\/]+?)(?:\\/([^\\/]+?))?(?:\\/([^\\/]+?))?(?:\\/)?$";
                    params: [
                        { name: "tab"; prefix: "/"; delimiter: "/"; optional: false; repeat: false; pattern: "[^\\/]+?" },
                        { name: "id"; prefix: "/"; delimiter: "/"; optional: true; repeat: false; pattern: "[^\\/]+?" },
                        { name: "type"; prefix: "/"; delimiter: "/"; optional: true; repeat: false; pattern: "[^\\/]+?" }
                    ];
                    transition: "RouteSlideTransition";
                }
            ];
        }
    ];
}
