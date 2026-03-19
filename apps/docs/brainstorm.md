# Development Environment
For all features, During the development I want to store the data in the localstorage (indexdb), but in production I want same function to call api to store the data.

create a tanstack queries to call either localstorage or api (based on env variables)
if VITE_API_URL is 'indexdb' then save to browser indexdb, if not call should be passed on to the api

also add another package called sdk (@rahataid/sdk), it should host all the types and shared between frontend and backend. It should also host all the api calls to the server.

# Core
- I want option to choose font from general settings. These are the fonts choices
current font
- for apps/web, I want to have 5 other color themes. (vibrant theme like current orange)
I should be able to change it from settings/general. once changed the theme should be stored in localstorage in user profile, so that it is persistent.

## Treasury
treasury should maintain balance separately based on the tokens (convert existing currency to token). When allocated to project you have to choose which token and decrease from that balance. update ui to show balances by token.

## Plugins
Create a plugins folder (same as projects), where all the plugins are stored.
each plugin can have backend and frontend, which will be registered with apps/api or apps/web.
for now create plugins for vendors and fund management. move the code from apps/web and registered them

## Project
Rahat has multiple type of projects like
beneficiary management
Cash Voucher Assistance (CVA)
Microlearning
Anticipatory Action (AA)
Microloans


create a package called project (@rahataid/projects-shared)
This will host the common modules shared by project frontend and backend plugins.

create a frontend module called beneficiary. It should have the component to list beneficiary with beneficiary details
make it look like http://localhost:3002/users page

Each project type is a plugin with backend (nestjs) and frontend. each of which can be published and npm package (eg. @rahataid/project-cva). the plugin should be registered

once registered, When adding a project you can select project type that has been registered.

I want the project plugins to be stored in projects (same level as apps and packages).

update apps/api and apps/web to registered plugins

- Each project should have a primary token. add this during the project creation
Primary token will be used to calculate the rate in non-cash benefits.
-all the files related to user frontend should be in apps/web, not in project-shared directory as it is core part of the application.

## Beneficiaries
in project beneficiaries, create beneficiary add and edit page. also add delete in action menu.

in project beneficiaries, add group feature where beneficiaries can be added ro removed to groups. 
groups can be added or removed.

### Benefits
the fund that has been allocated to the project should be reflected in the project dashboard as well.

in project when adding a benefit to the beneficiary, it has to go through step by step process (not in popup, instead in page).
- how much total amount of particular token is being distributed. it must be equal to or less than the allocated token for that project.
- how much token each beneficiary will be allocated
- if it is non token benefits, list of items with token cost per item, which will give the total benefit package cost.
- it will then be taken to benefit detail page.

- in project benefits new form, I want to ask name and type of benefit, description before moving to the next step. total amount distribution (in primary token terms).
For non-cash benefit, I should be able to add multiple items with cost per item. It should calculate the total token for the collection of package. This will calculate how many beneficiaries will get the distribution/

each package will be delivered to the beneficiary.

Total beneficiaries in each project should be determined based on total amount to be distributed and amount per beneficiary.

This total is the maximum beneficiaries that can be added for the benefit

after the new benefit is created, i should be taken to benefit detail page.
benefit details should have benefit details on top with tabs below that.
these are the tabs 'information, beneficiaries, distribution log'

in beneficiaries tab, I should be able to add beneficiaries.
- In benefits edit, I should not be able to change type.
- I should be able to delete benefits

In benefits page, non-cash can be distributed only from the balance of primary token (not other tokens), other tokens can only distributed as cash.

### Fund management
create a shared project fund management. It will show the following.

Primary token is defined in project detail.
In project fund management, that should be considered primary token even if it has zero balance.

List of tokens and balances.
Token activities table

