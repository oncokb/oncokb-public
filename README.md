# OncoKB Public Website
Repository for OncoKB public website front-end module.

This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.11.1.

## Sass
OncoKB is relying on Sass. You will need to first install Ruby and Compass:
- Install Ruby by downloading from [here](http://rubyinstaller.org/downloads/) or use Homebrew
- Install the compass gem:
```
gem install compass
```
## Install project
1. Install npm and bower globally
2. Go to oncokb-public root directory
3. npm install
4. bower install

## Build and development
1. Set legacyLink, privateApiLink and apiLink in app/scripts/app.js to proper values to fetch data. For example, public oncokb api could be used as below: 
```
.constant('legacyLink', 'http://oncokb.org/legacy-api/')
.constant('privateApiLink', 'http://oncokb.org/api/private/')
.constant('apiLink', 'http://oncokb.org/api/v1/')
```
2. Run `grunt` for building and `grunt serve` for preview.

## Testing

Running `grunt test` will run the unit tests with karma.

##Coding Rules
Because of the similarity of the project, we follow jhipster requirement.
To ensure consistency throughout the source code, keep these rules in mind as you are working:

* All files must follow the [.editorconfig file](http://editorconfig.org/) located at the root of the project.
* Web apps JavaScript files **must follow** [Google's JavaScript Style Guide](https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml).
* AngularJS files **must follow** [John Papa's Angular 1 style guide] (https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md).

License
--------------------

OncoKB free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License, version 3, as published by the Free Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

A public instance of OncoKB (http://oncokb.org) is hosted and maintained by Memorial Sloan Kettering Cancer Center. It provides access to all curators in MSKCC knowledgebase team.

If you are interested in coordinating the development of new features, please contact team@oncokb.org.
