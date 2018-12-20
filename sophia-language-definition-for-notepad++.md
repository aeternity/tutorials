# TUTORIAL: How to Install Sophia Notepad++ Language Definition

Here are the steps to setup syntax highlighting for Sophia language in Notepad++.

The next steps are to implement language server and also a VSCode plugin for Sophia (something like [this](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity) for Solidity).


### 1. Download and install Notepad++
Here is a [link](https://notepad-plus-plus.org/).

### 2. Set Dark Theme

Save the theme as *<name>*.xml to Notepad++\themes (or where you chose to store the application data).
    
VS Dark Theme (mandatory): https://gist.github.com/kraikov/7c7947661ea088012b244902e21ce970
- Windows: The application data is either in %appdata%/Notepad++ or in your program files.
- Linux (if installed via snap): The application data is in: /home/<username>/snap/notepad-plus-plus/common/.wine/drive_c/users/<username>/Application Data/Notepad++

### 3. Activate Sophia Definition

Save the Sophia definition as *<name>*.xml, go to Notepad++. In the top bar select Language -> Define your language... -> Import and then select the xml file.
    
Download the Sophia definition [here](https://gist.github.com/kraikov/687b7bb54f84a173b060a5919e1c8009).

