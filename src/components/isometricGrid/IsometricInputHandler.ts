import * as THREE from 'three';

export interface ClickableObject {
  mesh: THREE.Object3D;
  id: string;
  data?: any; // game-specific data
}

export interface IsometricInputHandler {
  registerClickable: (mesh: THREE.Object3D, id: string, data?: any) => void;
  unregisterClickable: (mesh: THREE.Object3D) => void;
  clearClickables: () => void;
  handleMouseDown: (event: MouseEvent) => string | null;
  handleMouseMove: (event: MouseEvent) => string | null;
  handleMouseUp: (event: MouseEvent) => string | null;
  // --- ADDED THIS ---
  getDraggedId: () => string | null;
  // ------------------
  setHoverCallback: (callback: (id: string | null) => void) => void;
  setClickCallback: (callback: (id: string, data?: any) => void) => void;
  setDragStartCallback: (callback: (id: string, data?: any) => boolean) => void;
  setDragEndCallback: (callback: (draggedId: string, data: any, dropPosition: THREE.Vector3, dropTargetId: string | null) => void) => void;
}

export function createIsometricInputHandler(
  camera: THREE.Camera,
  _scene: THREE.Scene,
  domElement: HTMLElement
): IsometricInputHandler {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const clickables = new Map<THREE.Object3D, ClickableObject>();
  
  const DRAG_HEIGHT_OFFSET = 0.5; 
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const planeIntersectPoint = new THREE.Vector3();

  let hoverCallback: ((id: string | null) => void) | null = null;
  let clickCallback: ((id: string, data?: any) => void) | null = null;
  let dragStartCallback: ((id: string, data?: any) => boolean) | null = null;
  let dragEndCallback: ((draggedId: string, data: any, dropPos: THREE.Vector3, dropTargetId: string | null) => void) | null = null;
  
  let currentHoveredId: string | null = null;
  let isDragging = false;
  let draggedObject: ClickableObject | null = null;
  let dragStartPosition = { x: 0, y: 0 };
  const DRAG_THRESHOLD = 5; 

  const updateMousePosition = (event: MouseEvent) => {
    const rect = domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  const raycast = (): ClickableObject | null => {
    raycaster.setFromCamera(mouse, camera);
    const meshes = Array.from(clickables.keys());
    const intersects = raycaster.intersectObjects(meshes, true);
    
    if (intersects.length > 0) {
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

  // --- ADDED THIS LOGIC ---
  const getDraggedId = () => {
    return (isDragging && draggedObject) ? draggedObject.id : null;
  };

  const handleMouseDown = (event: MouseEvent): string | null => {
    updateMousePosition(event);
    dragStartPosition = { x: event.clientX, y: event.clientY };
    const clickable = raycast();
    
    if (clickable) {
      draggedObject = clickable;
      return clickable.id;
    }
    return null;
  };

  const handleMouseMove = (event: MouseEvent): string | null => {
    updateMousePosition(event);

    if (isDragging && draggedObject) {
        raycaster.setFromCamera(mouse, camera);
        raycaster.ray.intersectPlane(dragPlane, planeIntersectPoint);
        
        draggedObject.mesh.position.set(
            planeIntersectPoint.x, 
            planeIntersectPoint.y + DRAG_HEIGHT_OFFSET, 
            planeIntersectPoint.z
        );
        return draggedObject.id;
    }

    if (!isDragging && draggedObject) {
         const dragDistance = Math.sqrt(
            Math.pow(event.clientX - dragStartPosition.x, 2) + 
            Math.pow(event.clientY - dragStartPosition.y, 2)
        );

        if (dragDistance > DRAG_THRESHOLD) {
            let allowed = true;
            if (dragStartCallback) {
                allowed = dragStartCallback(draggedObject.id, draggedObject.data);
            }

            if (allowed) {
                isDragging = true;
                domElement.style.cursor = 'grabbing';
            } else {
                draggedObject = null;
            }
        }
    }

    if (!isDragging) {
        const clickable = raycast();
        const newHoveredId = clickable ? clickable.id : null;
        
        if (newHoveredId !== currentHoveredId) {
            currentHoveredId = newHoveredId;
            if (hoverCallback) hoverCallback(currentHoveredId);
        }
        
        domElement.style.cursor = clickable ? 'grab' : 'default';
        return currentHoveredId;
    }
    
    return null;
  };

  const handleMouseUp = (event: MouseEvent): string | null => {
    updateMousePosition(event);
    
    if (isDragging && draggedObject) {
      draggedObject.mesh.visible = false;
      const targetUnderneath = raycast();
      draggedObject.mesh.visible = true;

      if (dragEndCallback) {
        dragEndCallback(
            draggedObject.id, 
            draggedObject.data, 
            draggedObject.mesh.position.clone(),
            targetUnderneath ? targetUnderneath.id : null
        );
      }
    } else if (draggedObject) {
      if (clickCallback) {
        clickCallback(draggedObject.id, draggedObject.data);
      }
    }
    
    isDragging = false;
    draggedObject = null;
    dragStartPosition = { x: 0, y: 0 };
    domElement.style.cursor = 'default';
    
    const clickable = raycast();
    currentHoveredId = clickable ? clickable.id : null;
    if (hoverCallback) hoverCallback(currentHoveredId);
    
    return clickable ? clickable.id : null;
  };

  const setHoverCallback = (cb: (id: string | null) => void) => { hoverCallback = cb; };
  const setClickCallback = (cb: (id: string, data?: any) => void) => { clickCallback = cb; };
  const setDragStartCallback = (cb: (id: string, data?: any) => boolean) => { dragStartCallback = cb; };
  const setDragEndCallback = (cb: (draggedId: string, data: any, dropPos: THREE.Vector3, dropTargetId: string | null) => void) => { dragEndCallback = cb; };

  return {
    registerClickable,
    unregisterClickable,
    clearClickables,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    getDraggedId, // Exposed here
    setHoverCallback,
    setClickCallback,
    setDragStartCallback,
    setDragEndCallback,
  };
}