Welcome to your new TanStack app!

# Getting Started

To run this application:

```bash
npm install
npm run start
```

# Building For Production

To build this application for production:

```bash
npm run build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
npm run test
```

## Styling

This project uses CSS for styling.

## Routing

This project uses [TanStack Router](https://tanstack.com/router). The initial setup is a file based router. Which means that the routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add another a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you use the `<Outlet />` component.

Here is an example layout that includes a header:

```tsx
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Link } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
```

The `<TanStackRouterDevtools />` component is not required so you can remove it if you don't want it in your layout.

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
const peopleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/people",
  loader: async () => {
    const response = await fetch("https://swapi.dev/api/people");
    return response.json() as Promise<{
      results: {
        name: string;
      }[];
    }>;
  },
  component: () => {
    const data = peopleRoute.useLoaderData();
    return (
      <ul>
        {data.results.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    );
  },
});
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

### React-Query

React-Query is an excellent addition or alternative to route loading and integrating it into you application is a breeze.

First add your dependencies:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

Next we'll need to create a query client and provider. We recommend putting those in `main.tsx`.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ...

const queryClient = new QueryClient();

// ...

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}
```

You can also add TanStack Query Devtools to the root route (optional).

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools />
    </>
  ),
});
```

Now you can use `useQuery` to fetch your data.

```tsx
import { useQuery } from "@tanstack/react-query";

import "./App.css";

function App() {
  const { data } = useQuery({
    queryKey: ["people"],
    queryFn: () =>
      fetch("https://swapi.dev/api/people")
        .then((res) => res.json())
        .then((data) => data.results as { name: string }[]),
    initialData: [],
  });

  return (
    <div>
      <ul>
        {data.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

You can find out everything you need to know on how to use React-Query in the [React-Query documentation](https://tanstack.com/query/latest/docs/framework/react/overview).

## State Management

Another common requirement for React applications is state management. There are many options for state management in React. TanStack Store provides a great starting point for your project.

First you need to add TanStack Store as a dependency:

```bash
npm install @tanstack/store
```

Now let's create a simple counter in the `src/App.tsx` file as a demonstration.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

function App() {
  const count = useStore(countStore);
  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
    </div>
  );
}

export default App;
```

One of the many nice features of TanStack Store is the ability to derive state from other state. That derived state will update when the base state updates.

Let's check this out by doubling the count using derived state.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store, Derived } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

const doubledStore = new Derived({
  fn: () => countStore.state * 2,
  deps: [countStore],
});
doubledStore.mount();

function App() {
  const count = useStore(countStore);
  const doubledCount = useStore(doubledStore);

  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
      <div>Doubled - {doubledCount}</div>
    </div>
  );
}

export default App;
```

We use the `Derived` class to create a new store that is derived from another store. The `Derived` class has a `mount` method that will start the derived store updating.

Once we've created the derived store we can use it in the `App` component just like we would any other store using the `useStore` hook.

You can find out everything you need to know on how to use TanStack Store in the [TanStack Store documentation](https://tanstack.com/store/latest).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).



```
yesFutureNew
├─ .cta.json
├─ .htaccess
├─ assets
│  ├─ auth-shell-BusDWuDu.js
│  ├─ chevron-right-Cej1iZnI.js
│  ├─ circle-question-mark-CHx2hk8X.js
│  ├─ copy-7SKDNWf0.js
│  ├─ filter-section-BmvGrikK.js
│  ├─ index-32yRXJ5m.css
│  ├─ index-BgWLT3Mf.js
│  ├─ index-CKlw8yx7.js
│  ├─ index-CYzS02Sm.js
│  ├─ index-D7uWj47q.js
│  ├─ index-Dr9mH5IZ.js
│  ├─ index-lb-Quipb.js
│  ├─ layers-CVBnYAWh.js
│  ├─ magic-gold-matrix-CS6gDKqn.js
│  ├─ magic-level-CP9mA7tU.js
│  ├─ magic-level-DuI1yJoy.js
│  ├─ programe-page-header-DGBZyE_3.js
│  ├─ proxy-BncZrLTj.js
│  ├─ rank-progress-card-1ugvqS5O.js
│  ├─ refresh-cw-DJZrBWKU.js
│  ├─ route-B-aIantf.js
│  ├─ route-Bgvc0Ejy.js
│  ├─ route-BPtG0dcR.js
│  ├─ route-C-GJ0B1J.js
│  ├─ route-CETj7Rzr.js
│  ├─ route-CODYA5lo.js
│  ├─ route-CwXNMJDs.js
│  ├─ route-D2dIEAMk.js
│  ├─ route-gcF3NvJR.js
│  ├─ route-GKffx5vN.js
│  ├─ route-h9szipeh.js
│  ├─ route-nEgCIy_q.js
│  ├─ route-RujwphWu.js
│  ├─ sign-in-DbkXoJZ3.js
│  ├─ sign-up-C_GEo5DT.js
│  ├─ user-C3aTiffX.js
│  ├─ useRouterState-Bngy07KO.js
│  ├─ users-xS8jGOFn.js
│  ├─ utils-DIMB1LcC.js
│  ├─ wallet-cell-C4sDa85A.js
│  ├─ x-gold-level-page-C8aTdJry.js
│  ├─ _level-D_ho3Trm.js
│  └─ _level-U-gwhrOW.js
├─ bg.webp
├─ contract.sol
├─ index.html
├─ logo.png
├─ package-lock.json
├─ package.json
├─ public
│  ├─ .htaccess
│  ├─ background.png
│  ├─ bg.webp
│  ├─ logo.png
│  └─ ranks
│     ├─ rank1.png
│     ├─ rank2.png
│     ├─ rank3.png
│     ├─ rank4.png
│     ├─ rank5.png
│     ├─ rank6.png
│     └─ rank7.png
├─ ranks
│  ├─ rank1.png
│  ├─ rank2.png
│  ├─ rank3.png
│  ├─ rank4.png
│  ├─ rank5.png
│  ├─ rank6.png
│  └─ rank7.png
├─ README.md
├─ src
│  ├─ App.css
│  ├─ components
│  │  ├─ comings-soon.tsx
│  │  ├─ dashboard
│  │  │  ├─ profile-header.tsx
│  │  │  ├─ program-card.tsx
│  │  │  ├─ recent-activety.tsx
│  │  │  ├─ stats-overview.tsx
│  │  │  └─ yesfuture-programs.tsx
│  │  ├─ data-table.tsx
│  │  ├─ editable-profile-avatar.tsx
│  │  ├─ filter-section.tsx
│  │  ├─ header.tsx
│  │  ├─ leaderboard
│  │  │  └─ leaderboard-page.tsx
│  │  ├─ level-card.tsx
│  │  ├─ level-page-layout.tsx
│  │  ├─ level-pages
│  │  │  ├─ index.ts
│  │  │  ├─ magic-level-package-page.tsx
│  │  │  ├─ x-gold-level-page.tsx
│  │  │  └─ x-three-level-page.tsx
│  │  ├─ level-summary-card.tsx
│  │  ├─ links
│  │  │  ├─ link-card.tsx
│  │  │  ├─ link-page-skeleton.tsx
│  │  │  ├─ link-stats.tsx
│  │  │  └─ new-partners-chart.tsx
│  │  ├─ magic-level
│  │  │  ├─ magic-level-card.tsx
│  │  │  └─ magic-level-grid.tsx
│  │  ├─ magic-level-summary-card.tsx
│  │  ├─ matrix-grid-x-four.tsx
│  │  ├─ matrix-grid-x-gold.tsx
│  │  ├─ matrix-grid.tsx
│  │  ├─ matrix-level-card-x-four.tsx
│  │  ├─ matrix-level-card-x-gold.tsx
│  │  ├─ matrix-level-card.tsx
│  │  ├─ matrix-tree-card-x-gold.tsx
│  │  ├─ modal.tsx
│  │  ├─ not-found.tsx
│  │  ├─ package-card-selector.tsx
│  │  ├─ package-overview.tsx
│  │  ├─ package-purchase-form.tsx
│  │  ├─ package-select-trigger.tsx
│  │  ├─ package-wheel-selector.tsx
│  │  ├─ page-header.tsx
│  │  ├─ preview
│  │  │  ├─ dashboard
│  │  │  │  ├─ profile-header.tsx
│  │  │  │  ├─ program-card.tsx
│  │  │  │  ├─ stats-overview.tsx
│  │  │  │  └─ yesfuture-programs.tsx
│  │  │  ├─ level-pages
│  │  │  │  ├─ magic-gold-matrix-package-page.tsx
│  │  │  │  ├─ magic-level-package-page.tsx
│  │  │  │  └─ sponsor-magic-package-page.tsx
│  │  │  ├─ magic-gold-matrix
│  │  │  │  ├─ matrix-grid-x-gold.tsx
│  │  │  │  └─ matrix-level-card-x-gold.tsx
│  │  │  ├─ magic-level
│  │  │  │  ├─ magic-level-card.tsx
│  │  │  │  └─ magic-level-grid.tsx
│  │  │  ├─ magic-level-summary-card.tsx
│  │  │  ├─ preview-header.tsx
│  │  │  ├─ preview-sidebar.tsx
│  │  │  ├─ program-pages
│  │  │  │  ├─ magic-gold-matrix.tsx
│  │  │  │  ├─ magic-level.tsx
│  │  │  │  └─ sponser-magic.tsx
│  │  │  └─ sponsor-magic
│  │  │     ├─ matrix-grid.tsx
│  │  │     └─ matrix-level-card.tsx
│  │  ├─ profit-breakdown-card.tsx
│  │  ├─ program-pages
│  │  │  ├─ index.ts
│  │  │  ├─ magic-gold-matrix.tsx
│  │  │  ├─ magic-level.tsx
│  │  │  ├─ sponser-magic.tsx
│  │  │  ├─ x-four.tsx
│  │  │  ├─ x-two.tsx
│  │  │  └─ xxx.tsx
│  │  ├─ programe-page-header.tsx
│  │  ├─ rank-progress-card.tsx
│  │  ├─ sidebar.tsx
│  │  ├─ skeletons
│  │  │  └─ package-summery-card
│  │  │     ├─ magic-gold-matrix-summery-card-skeleton.tsx
│  │  │     ├─ magic-level-summary-card-skeleton.tsx
│  │  │     └─ sponsor-level-summary-card-skeleton.tsx
│  │  ├─ social
│  │  │  ├─ profile-header.tsx
│  │  │  ├─ profile-stats.tsx
│  │  │  └─ rank-badges.tsx
│  │  ├─ sponser-level-summary-card.tsx
│  │  ├─ wallet-cell.tsx
│  │  └─ WalletGuard.tsx
│  ├─ constants
│  │  ├─ color.ts
│  │  └─ programs.ts
│  ├─ layouts
│  │  └─ page-layout.tsx
│  ├─ lib
│  │  ├─ auth-api.ts
│  │  ├─ auth-shell.tsx
│  │  ├─ helper.ts
│  │  ├─ parse-matrix-tree.ts
│  │  ├─ use-wallet.ts
│  │  ├─ utils.ts
│  │  └─ wallet.ts
│  ├─ main.tsx
│  ├─ reportWebVitals.ts
│  ├─ routes
│  │  ├─ (auth)
│  │  │  ├─ ref.$id.tsx
│  │  │  ├─ route.tsx
│  │  │  ├─ sign-in.tsx
│  │  │  └─ sign-up.tsx
│  │  ├─ (protected)
│  │  │  ├─ dashboard
│  │  │  │  ├─ $program
│  │  │  │  │  ├─ $level.tsx
│  │  │  │  │  ├─ index.tsx
│  │  │  │  │  └─ route.tsx
│  │  │  │  ├─ index.tsx
│  │  │  │  └─ route.tsx
│  │  │  ├─ leaderboard
│  │  │  │  └─ route.tsx
│  │  │  ├─ links
│  │  │  │  └─ route.tsx
│  │  │  ├─ package-purchase
│  │  │  │  ├─ index.tsx
│  │  │  │  ├─ magic-gold-matrix.tsx
│  │  │  │  ├─ magic-level.tsx
│  │  │  │  ├─ route.tsx
│  │  │  │  └─ sponsor-magic.tsx
│  │  │  ├─ partners
│  │  │  │  └─ route.tsx
│  │  │  ├─ route.tsx
│  │  │  ├─ social
│  │  │  │  └─ route.tsx
│  │  │  ├─ stats
│  │  │  │  └─ route.tsx
│  │  │  ├─ team
│  │  │  │  └─ route.tsx
│  │  │  └─ _income
│  │  │     ├─ magic-gold-matrix.tsx
│  │  │     ├─ magic-level.tsx
│  │  │     └─ sponsor-magic.tsx
│  │  ├─ index.tsx
│  │  ├─ preview
│  │  │  ├─ dashboard
│  │  │  │  ├─ $program
│  │  │  │  │  ├─ $level.tsx
│  │  │  │  │  ├─ index.tsx
│  │  │  │  │  └─ route.tsx
│  │  │  │  ├─ index.tsx
│  │  │  │  └─ route.tsx
│  │  │  ├─ links
│  │  │  │  └─ route.tsx
│  │  │  ├─ partners
│  │  │  │  └─ route.tsx
│  │  │  ├─ route.tsx
│  │  │  ├─ team
│  │  │  │  └─ route.tsx
│  │  │  └─ _income
│  │  │     ├─ magic-gold-matrix.tsx
│  │  │     ├─ magic-level.tsx
│  │  │     └─ sponsor-magic.tsx
│  │  └─ __root.tsx
│  ├─ routeTree.gen.ts
│  ├─ store
│  │  └─ user.ts
│  └─ styles.css
├─ tsconfig.json
├─ tsconfig.tsbuildinfo
├─ vite.config.ts
└─ web-assets
   └─ img
      ├─ img-1.svg
      └─ logo.png

```