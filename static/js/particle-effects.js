const SEPARATION = 35, AMOUNTX = 100, AMOUNTY = 100;

let container, stats;
let camera, scene, renderer;

let particles, count = 0;

container = document.getElementById("canvas");

var vertexShaderSrc = `
    attribute float scale;

    void main() {
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_PointSize = scale * ( 300.0 / - mvPosition.z );
        gl_Position = projectionMatrix * mvPosition;
    }`;

var fragmentShaderSrc = `
    uniform vec3 color;

    void main() {
        if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;
        gl_FragColor = vec4( color, 1.0 );
    }`;

init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera( 60, container.clientWidth / container.clientHeight, 1, 10000 );
    camera.position.z = 800;
    camera.position.y = 600;

    camera.rotation.x = -Math.PI/2

    scene = new THREE.Scene();

    const numParticles = AMOUNTX * AMOUNTY;

    const positions = new Float32Array( numParticles * 3 );
    const scales = new Float32Array( numParticles );

    let i = 0, j = 0;

    for ( let ix = 0; ix < AMOUNTX; ix ++ ) {
        for ( let iy = 0; iy < AMOUNTY; iy ++ ) {
            positions[ i ] = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 ); // x
            positions[ i + 1 ] = 0; // y
            positions[ i + 2 ] = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 ); // z

            scales[ j ] = 1;
            i += 3;
            j ++;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.setAttribute( 'scale', new THREE.BufferAttribute( scales, 1 ) );

    const material = new THREE.ShaderMaterial( {
        uniforms: {
            color: { value: new THREE.Color( 0x99aaaa ) },
        },
        vertexShader: vertexShaderSrc,
        fragmentShader: fragmentShaderSrc,
    } );

    particles = new THREE.Points( geometry, material );
    scene.add( particles );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( container.clientWidth, container.clientHeight );
    renderer.setClearColor( 0xffffff, 1);
    container.appendChild( renderer.domElement );

    container.style.touchAction = 'none';

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( container.clientWidth, container.clientHeight );
}


function animate() {
    requestAnimationFrame( animate );
    render();
}

function render() {
    const positions = particles.geometry.attributes.position.array;
    const scales = particles.geometry.attributes.scale.array;
    
    let i = 0, j = 0;

    for ( let ix = 0; ix < AMOUNTX; ix ++ ) {
        for ( let iy = 0; iy < AMOUNTY; iy ++ ) {
            var factor = 25;
            positions[ i + 1 ] = ( Math.sin( ( ix + count ) * 0.5 ) * factor) +
                            ( Math.sin( ( iy + count ) * 0.5 ) * factor);

            scales[ j ] = ( Math.sin( ( ix + count ) * 0.5 ) + 1 ) * 5 +
                            ( Math.sin( ( iy + count ) * 0.5 ) + 1 ) * 5;

            i += 3;
            j ++;
        }
    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.scale.needsUpdate = true;

    renderer.render( scene, camera );

    count += 0.05;
}