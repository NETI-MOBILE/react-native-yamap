//
//  Suggest.swift
//  CocoaAsyncSocket
//
//  Created by Айнур Динмухаметов on 22.07.2020.
//
import Foundation
import YandexMapKit
import YandexMapKitSearch


/**
 * This example shows how to request a suggest for search requests.
 */
@objc(SuggestController)
class SuggestController: RCTViewManager {
    
    var suggestResults: [YMKSuggestItem] = []
    let searchManager = YMKSearch.sharedInstance().createSearchManager(with: .combined)
    var suggestSession: YMKSearchSuggestSession!
    
    let BOUNDING_BOX = YMKBoundingBox(
        southWest: YMKPoint(latitude: 55.55, longitude: 37.42),
        northEast: YMKPoint(latitude: 55.95, longitude: 37.82))
    let SUGGEST_OPTIONS = YMKSuggestOptions()
    
    @objc(suggest:)
    func suggest(query: String) {
        print("SUGGEST");
        suggestSession = searchManager.createSuggestSession()
        self.fetchSuggest();
        
    }
    
    func onSuggestResponse(_ items: [YMKSuggestItem]) {
        suggestResults = items
        for suggest in items {
            print("SSSSSSSSSSSS -> ")
            print(suggest.displayText)
        }
    }
    
    func onSuggestError(_ error: Error) {
        let suggestError = (error as NSError).userInfo[YRTUnderlyingErrorKey] as! YRTError
        var errorMessage = "Unknown error"
        if suggestError.isKind(of: YRTNetworkError.self) {
            errorMessage = "Network error"
        } else if suggestError.isKind(of: YRTRemoteError.self) {
            errorMessage = "Remote server error"
        }
        
    }
    
    func fetchSuggest() {
        let suggestHandler = {(response: [YMKSuggestItem]?, error: Error?) -> Void in
            if let items = response {
                print("SUGGEST_SUCCESS");
                self.onSuggestResponse(items)
            } else {
                self.onSuggestError(error!)
            }
        }
        
        DispatchQueue.main.async {
            self.suggestSession.suggest(
                withText: "test",
                window: self.BOUNDING_BOX,
                suggestOptions: self.SUGGEST_OPTIONS,
                responseHandler: suggestHandler)
        }
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}

