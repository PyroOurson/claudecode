use crate::api::Engine;
use serde_json::{Value, json};
use std::sync::Mutex;

static ENGINE: Mutex<Option<Engine>> = Mutex::new(None);
static OUTPUT: Mutex<Vec<u8>> = Mutex::new(Vec::new());

fn answer(status: u16, body: &Value) -> u32 {
    let bytes =
        serde_json::to_vec(body).unwrap_or_else(|_| b"{\"error\":\"internal error\"}".to_vec());
    if let Ok(mut output) = OUTPUT.lock() {
        *output = bytes;
    }
    u32::from(status)
}

#[unsafe(no_mangle)]
pub extern "C" fn alloc(len: usize) -> *mut u8 {
    let mut buffer = Vec::<u8>::with_capacity(len);
    let pointer = buffer.as_mut_ptr();
    std::mem::forget(buffer);
    pointer
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn dealloc(pointer: *mut u8, len: usize) {
    if !pointer.is_null() {
        drop(unsafe { Vec::from_raw_parts(pointer, 0, len) });
    }
}

unsafe fn input<'a>(pointer: *const u8, len: usize) -> &'a [u8] {
    if pointer.is_null() || len == 0 {
        &[]
    } else {
        unsafe { std::slice::from_raw_parts(pointer, len) }
    }
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn load(pointer: *const u8, len: usize) -> u32 {
    let bytes = unsafe { input(pointer, len) };
    match Engine::load(bytes) {
        Ok(engine) => {
            let status = answer(200, &engine.info());
            if let Ok(mut slot) = ENGINE.lock() {
                *slot = Some(engine);
            }
            status
        }
        Err(error) => answer(
            400,
            &json!({ "error": format!("cannot read the map file: {}", error) }),
        ),
    }
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn plan(pointer: *const u8, len: usize) -> u32 {
    let body = unsafe { input(pointer, len) };
    let Ok(slot) = ENGINE.lock() else {
        return answer(500, &json!({ "error": "internal error" }));
    };
    match slot.as_ref() {
        Some(engine) => {
            let (status, response) = engine.plan(body);
            answer(status, &response)
        }
        None => answer(
            503,
            &json!({ "error": "starting: the map is not loaded yet" }),
        ),
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn output_ptr() -> *const u8 {
    OUTPUT
        .lock()
        .map_or(std::ptr::null(), |output| output.as_ptr())
}

#[unsafe(no_mangle)]
pub extern "C" fn output_len() -> usize {
    OUTPUT.lock().map_or(0, |output| output.len())
}
