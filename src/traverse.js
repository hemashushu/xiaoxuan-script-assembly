// Copyright (c) 2025 Hemashushu <hippospark@gmail.com>, All rights reserved.
//
// This Source Code Form is subject to the terms of
// the Mozilla Public License version 2.0 and additional exceptions.
// For more details, see the LICENSE, LICENSE.additional, and CONTRIBUTING files.

// Tree Traversal:
// - Depth First Search or DFS
//   1. Inorder Traversal (Order: Left -> Root -> Right)
//   2. Preorder Traversal (Order: Root -> Left -> Right)
//   3. Postorder Traversal (Order: Left -> Right -> Root)
// - Level Order Traversal or Breadth First Search or BFS
//
// See:
// https://www.geeksforgeeks.org/dsa/tree-traversals-inorder-preorder-and-postorder/

// post order ast walker
const post_order_traverse = (nodes, visitor) => {

    nodes = Array.isArray(nodes) ? nodes : [nodes];
    nodes.forEach(node => {

        // 1. visit children first
        Object.keys(node).forEach((key_name) => {
            const value = node[key_name];
            const valueAsArray = Array.isArray(value) ? value : [value];

            valueAsArray.forEach((childNode) => {
                if (childNode.type !== undefined) {
                    // child node is an AST node instead of a value,
                    // since it has a `type` property.
                    // example:
                    // - `{ type: "number", value: 42 }`
                    // - `{ type: "binaryExpression", left: {...}, right: {...}, operator: "+" }`
                    post_order_traverse(childNode, visitor);
                }
            });
        });

        // 2. visit the current node
        visitor(node);
    });
};

export default post_order_traverse;