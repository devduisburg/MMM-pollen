# MMM-pollen
A MagicMirror module to display current pollen pollution and forecast for the next based on data from the "deutscher wetter dienst" (dwd).

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
	{
		module: "MMM-pollen",
		position: "bottom-center",	// This can be any of the regions.
		config: {
			// See 'Configuration options' for more information.
			locationLongitude: 6.77,
			locationLatitude: 51.4,
		}
	}
]
````

## Configuration options

The following properties can be configured:


| Option                       | Description
| ---------------------------- | -----------
| `locationLongitude`          | Longitude for the location for which the pollen pollution will be shown
| `locationLatitude`           | Latitude for the location for which the pollen pollution will be shown
| `noEmptyLines`               | Show only lines in the table for pollen with pollution greater than none. Default true
| `pollenLayers`               | List of pollen (see below) for which the pollution will be shown. Specify as a comma separated list, no spaces between values! Default: All from the list below

Possible pollen types:
----------------------
Pollenflug_Hasel,
Pollenflug_Erle,
Pollenflug_Esche,
Pollenflug_Birke,
Pollenflug_Graeser,
Pollenflug_Roggen,
Pollenflug_Beifuss,
Pollenflug_Ambrosia

## Installation of module and dependencies

* `git clone https://github.com/devduisburg/MMM-pollen.git` into `~/MagicMirror/modules` directory.

## Add to Config.js

    {
        module: "MMM-pollen",
		position: 'middle_center',
        config: {
			locationLongitude: 6.77,
			locationLatitude: 51.4,
			noEmptyLines: true,
			pollenLayers: "Pollenflug_Hasel,Pollenflug_Erle,Pollenflug_Esche,Pollenflug_Birke,Pollenflug_Graeser,Pollenflug_Roggen,Pollenflug_Beifuss,Pollenflug_Ambrosia"
        }
    },

	