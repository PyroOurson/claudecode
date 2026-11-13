import sys, bpy
sys.path.insert(0, '/tmp/gameplay-build/w/agents2/covers')
import kit as K
K.reset()
n = bpy.data.materials.new('x'); n.use_nodes = True
m = n.node_tree.nodes.new('ShaderNodeMix'); m.data_type = 'RGBA'
print([(i, s.name, s.type, s.enabled) for i, s in enumerate(m.inputs)])
print([(i, s.name, s.type) for i, s in enumerate(m.outputs)])
