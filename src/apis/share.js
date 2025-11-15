"use strict";

const utils = require('../utils');

function formatPreviewResult(data) {
    if (data.errors) {
        throw data.errors[0];
    }
    const previewData = data.data?.xma_preview_data;
    if (!previewData) {
        throw { error: "Could not generate a preview for this post." };
    }
    return {
        postID: previewData.post_id,
        header: previewData.header_title,
        subtitle: previewData.subtitle_text,
        title: previewData.title_text,
        previewImage: previewData.preview_url,
        favicon: previewData.favicon_url,
        headerImage: previewData.header_image_url
    };
}

module.exports = function(defaultFuncs, api, ctx) {
    return async function getPostPreview(postID, callback) {
        let cb;
        const returnPromise = new Promise((resolve, reject) => {
            cb = (err, data) => err ? reject(err) : resolve(data);
        });
        
        if (typeof callback === 'function') cb = callback;
        if (!postID) {
            return cb({ error: "A postID is required to generate a preview." });
        }

        const variables = {
            shareable_id: postID.toString(),
            scale: 3,
        };

        // Use configurable doc_id or default (may be outdated)
        // To update: Capture from live Messenger GraphQL traffic when sharing a post
        // Set ctx.options.sharePreviewDocId to override
        const docId = ctx.options?.sharePreviewDocId || '28939050904374351';

        const form = {
            fb_api_caller_class: 'RelayModern',
            fb_api_req_friendly_name: 'CometXMAProxyShareablePreviewQuery',
            variables: JSON.stringify(variables),
            doc_id: docId
        };

        try {
            const resData = await defaultFuncs
                .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
                .then(utils.parseAndCheckLogin(ctx, defaultFuncs));
            
            // Check for persisted query not found error (case-insensitive)
            if (resData?.errors) {
                const persistedQueryError = resData.errors.find(e => {
                    const msg = (e.message || '').toLowerCase();
                    return msg.includes('persistedquerynotfound') || 
                           msg.includes('document') && msg.includes('not found') ||
                           msg.includes('persisted query');
                });
                if (persistedQueryError) {
                    const error = {
                        error: "Facebook GraphQL doc_id expired. Please update ctx.options.sharePreviewDocId",
                        details: "Capture the current doc_id from Messenger web traffic (inspect CometXMAProxyShareablePreviewQuery request)",
                        currentDocId: docId,
                        fbError: persistedQueryError.message
                    };
                    utils.error("getPostPreview", error);
                    return cb(error);
                }
            }
            
            const result = formatPreviewResult(resData);
            return cb(null, result);
        } catch (err) {
            // Add helpful context for common failure modes
            if (err.message?.includes('UNHANDLED_REJECTION') || err.message?.includes('not found')) {
                err.hint = "The GraphQL doc_id may be outdated. Set ctx.options.sharePreviewDocId with current value from Messenger traffic.";
            }
            utils.error("getPostPreview", err);
            return cb(err);
        }

        return returnPromise;
    };
};
