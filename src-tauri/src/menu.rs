use tauri::{menu::{MenuBuilder, SubmenuBuilder}, AppHandle};

pub fn build_menu(app: &AppHandle) -> Result<(), tauri::Error> {
    let file_menu = SubmenuBuilder::new(app, "File")
        .quit()
        .build()?;

    let edit_menu = SubmenuBuilder::new(app, "Edit")
        .undo()
        .redo()
        .separator()
        .cut()
        .copy()
        .paste()
        .select_all()
        .build()?;

    let view_menu = SubmenuBuilder::new(app, "View")
        .text("toggle-search", "Toggle Search\tCmdOrCtrl+K")
        .build()?;

    let help_menu = SubmenuBuilder::new(app, "Help")
        .text("about", "About DevToolkit")
        .build()?;

    let menu = MenuBuilder::new(app)
        .item(&file_menu)
        .item(&edit_menu)
        .item(&view_menu)
        .item(&help_menu)
        .build()?;

    app.set_menu(menu)?;

    Ok(())
}
