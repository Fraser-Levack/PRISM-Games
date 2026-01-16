import * as THREE from 'three';

export interface ClickableObject {
  mesh: THREE.Object3D;
  id: string;
  data?: any; // game-specific data (e.g., peg index, disk size)
}

export interface IsometricInputHandler {
  registerClickable: (mesh: THREE.Object3D, id: string, data?: any) => void;
  unregisterClickable: (mesh: THREE.Object3D) => void;
  clearClickables: () => void;
  handleMouseDown: (event: MouseEvent) => string | null;
  handleMouseMove: (event: MouseEvent) => string | null;
  handleMouseUp: (event: MouseEvent) => string | null;
  setHoverCallback: (callback: (id: string | null) => void) => void;
  setClickCallback: (callback: (id: string, data?: any) => void) => void;
  setDragStartCallback: (callback: (id: string, data?: any) => void) => void;
  setDragEndCallback: (callback: (id: string | null, data?: any) => void) => void;
}

export function createIsometricInputHandler(
  camera: THREE.Camera,
  _scene: THREE.Scene,
  domElement: HTMLElement
): IsometricInputHandler {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const clickables = new Map<THREE.Object3D, ClickableObject>();
  
  let hoverCallback: ((id: string | null) => void) | null = null;
  let clickCallback: ((id: string, data?: any) => void) | null = null;
  let dragStartCallback: ((id: string, data?: any) => void) | null = null;
  let dragEndCallback: ((id: string | null, data?: any) => void) | null = null;
  let currentHoveredId: string | null = null;
  let isDragging = false;
  let draggedObjectId: string | null = null;
  let draggedObjectData: any = null;
  let dragStartPosition = { x: 0, y: 0 };
  const DRAG_THRESHOLD = 10; // pixels

  const updateMousePosition = (event: MouseEvent) => {
    const rect = domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  const raycast = (): ClickableObject | null => {
    raycaster.setFromCamera(mouse, camera);
    
    // Get all meshes from clickables
    const meshes = Array.from(clickables.keys());
    const intersects = raycaster.intersectObjects(meshes, true);
    
    if (intersects.length > 0) {
      // Find the first clickable parent
      let object = intersects[0].object;
      while (object) {
        const clickable = clickables.get(object);
        if (clickable) return clickable;
        object = object.parent as THREE.Object3D;
      }
    }
    return null;
  };

  const registerClickable = (mesh: THREE.Object3D, id: string, data?: any) => {
    clickables.set(mesh, { mesh, id, data });
  };

  const unregisterClickable = (mesh: THREE.Object3D) => {
    clickables.delete(mesh);
  };

  const clearClickables = () => {
    clickables.clear();
    currentHoveredId = null;
  };

  const handleMouseDown = (event: MouseEvent): string | null => {
    updateMousePosition(event);
    dragStartPosition = { x: event.clientX, y: event.clientY };
    const clickable = raycast();
    
    if (clickable) {
      // Start potential drag
      isDragging = true;
      draggedObjectId = clickable.id;
      draggedObjectData = clickable.data;
      
      if (dragStartCallback) {
        dragStartCallback(clickable.id, clickable.data);
      }
      
      return clickable.id;
    }
    return null;
  };

  const handleMouseMove = (event: MouseEvent): string | null => {
    updateMousePosition(event);
    const clickable = raycast();
    
    const newHoveredId = clickable ? clickable.id : null;
    
    if (newHoveredId !== currentHoveredId) {
      currentHoveredId = newHoveredId;
      if (hoverCallback) {
        hoverCallback(currentHoveredId);
      }
    }
    
    // Update cursor style
    if (isDragging) {
      domElement.style.cursor = 'grabbing';
    } else {
      domElement.style.cursor = clickable ? 'grab' : 'default';
    }
    
    return currentHoveredId;
  };

  const handleMouseUp = (event: MouseEvent): string | null => {
    updateMousePosition(event);
    const clickable = raycast();
    
    if (isDragging && draggedObjectId) {
      // Calculate drag distance
      const dragDistance = Math.sqrt(
        Math.pow(event.clientX - dragStartPosition.x, 2) +
        Math.pow(event.clientY - dragStartPosition.y, 2)
      );
      
      // Only treat as drag if mouse moved beyond threshold
      if (dragDistance > DRAG_THRESHOLD) {
        // This was a real drag - call drag end callback
        if (dragEndCallback) {
          dragEndCallback(clickable ? clickable.id : null, clickable?.data);
        }
      } else {
        // This was essentially a click (minimal movement) - call click callback
        if (clickCallback && draggedObjectId) {
          clickCallback(draggedObjectId, draggedObjectData);
        }
      }
    }
    
    // Reset drag state
    isDragging = false;
    draggedObjectId = null;
    draggedObjectData = null;
    dragStartPosition = { x: 0, y: 0 };
    
    // Always reset cursor and hover state when mouse is released
    domElement.style.cursor = 'default';
    currentHoveredId = null;
    if (hoverCallback) {
      hoverCallback(null);
    }
    
    return clickable ? clickable.id : null;
  };

  const setHoverCallback = (callback: (id: string | null) => void) => {
    hoverCallback = callback;
  };

  const setClickCallback = (callback: (id: string, data?: any) => void) => {
    clickCallback = callback;
  };

  const setDragStartCallback = (callback: (id: string, data?: any) => void) => {
    dragStartCallback = callback;
  };

  const setDragEndCallback = (callback: (id: string | null, data?: any) => void) => {
    dragEndCallback = callback;
  };

  return {
    registerClickable,
    unregisterClickable,
    clearClickables,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    setHoverCallback,
    setClickCallback,
    setDragStartCallback,
    setDragEndCallback,
  };
}
